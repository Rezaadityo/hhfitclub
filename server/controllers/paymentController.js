import crypto from "crypto";
import { snap } from "../config/midtrans.js";
import sequelize from "../config/db.js";
import { Order, OrderItem, Product, Payment, Transaction, User, Membership } from "../models/index.js";
import asyncHandler from "../utils/asyncHandler.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

const mapMidtransStatus = (transactionStatus, fraudStatus) => {
  if (transactionStatus === "capture") {
    return fraudStatus === "challenge" ? "pending" : "success";
  }

  if (transactionStatus === "settlement") {
    return "success";
  }

  if (transactionStatus === "expire") {
    return "expired";
  }

  if (["cancel", "deny", "failure"].includes(transactionStatus)) {
    return "failed";
  }

  return "pending";
};

const verifySignature = ({ order_id, status_code, gross_amount, signature_key }) => {
  const raw = `${order_id}${status_code}${gross_amount}${process.env.MIDTRANS_SERVER_KEY}`;
  const signature = crypto.createHash("sha512").update(raw).digest("hex");

  return signature === signature_key;
};

export const createPayment = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    where: {
      id: req.params.orderId,
      user_id: req.user.id
    },
    include: [
      {
        model: OrderItem,
        as: "items",
        include: [{ model: Product, as: "product" }]
      },
      {
        model: User,
        as: "user"
      },
      {
        model: Membership,
        as: "membership"
      }
    ]
  });

  if (!order) {
    return errorResponse(res, "Order tidak ditemukan.", 404);
  }

  if (order.status === "paid") {
    return errorResponse(res, "Order sudah dibayar.", 409);
  }

  const expiredAt = new Date(Date.now() + 15 * 60 * 1000);
  const invoiceId = `HHFIT-${order.id}-${Date.now()}`;
  const grossAmount = Number(order.total_price);
  const itemDetails =
    order.order_type === "membership"
      ? [
          {
            id: `membership-${order.membership_id}`,
            price: grossAmount,
            quantity: 1,
            name: `Membership ${order.membership?.name || "HH FIT CLUB"}`.substring(0, 50)
          }
        ]
      : order.items.map((item) => ({
          id: String(item.product_id),
          price: Number(item.price),
          quantity: Number(item.quantity),
          name: item.product.name.substring(0, 50)
        }));

  const calculatedTotal = itemDetails.reduce((total, item) => total + item.price * item.quantity, 0);

  if (itemDetails.length === 0 || calculatedTotal !== grossAmount) {
    return errorResponse(res, "Total order tidak valid.", 422);
  }

  const parameter = {
    transaction_details: {
      order_id: invoiceId,
      gross_amount: grossAmount
    },
    credit_card: {
      secure: true
    },
    enabled_payments: ["qris"],
    item_details: itemDetails,
    customer_details: {
      first_name: order.user.name,
      email: order.user.email,
      phone: order.user.phone
    },
    expiry: {
      start_time: new Date().toISOString().replace("T", " ").substring(0, 19) + " +0700",
      unit: "minutes",
      duration: 15
    }
  };

  const transaction = await snap.createTransaction(parameter);
  const [payment, created] = await Payment.findOrCreate({
    where: {
      order_id: order.id
    },
    defaults: {
      order_id: order.id,
      midtrans_token: transaction.token,
      redirect_url: transaction.redirect_url,
      qr_url: transaction.qr_url || null,
      status: "pending",
      expired_at: expiredAt
    }
  });

  if (!created) {
    await payment.update({
      midtrans_token: transaction.token,
      redirect_url: transaction.redirect_url,
      qr_url: transaction.qr_url || payment.qr_url,
      status: "pending",
      expired_at: expiredAt
    });
  }

  await Transaction.findOrCreate({
    where: {
      payment_id: payment.id
    },
    defaults: {
      order_id: order.id,
      payment_id: payment.id,
      amount: grossAmount,
      status: "pending"
    }
  });

  if (!created) {
    const existingTransaction = await Transaction.findOne({
      where: {
        payment_id: payment.id
      }
    });

    if (existingTransaction) {
      await existingTransaction.update({
        amount: grossAmount,
        status: "pending",
        paid_at: null
      });
    }
  }

  return successResponse(res, "Transaksi pembayaran berhasil dibuat.", {
    token: transaction.token,
    redirect_url: transaction.redirect_url,
    qr_url: transaction.qr_url || null,
    amount: grossAmount,
    expired_at: expiredAt
  });
});

export const handleNotification = asyncHandler(async (req, res) => {
  const notification = req.body;

  if (!verifySignature(notification)) {
    return errorResponse(res, "Signature Midtrans tidak valid.", 403);
  }

  const orderIdMatch = String(notification.order_id).match(/^HHFIT-(\d+)-/);

  if (!orderIdMatch) {
    return errorResponse(res, "Order ID Midtrans tidak valid.", 422);
  }

  const orderId = Number(orderIdMatch[1]);
  const mappedStatus = mapMidtransStatus(notification.transaction_status, notification.fraud_status);

  await sequelize.transaction(async (transaction) => {
    const payment = await Payment.findOne({
      where: {
        order_id: orderId
      },
      transaction
    });

    if (!payment) {
      throw Object.assign(new Error("Payment tidak ditemukan."), { statusCode: 404 });
    }

    await payment.update(
      {
        status: mappedStatus
      },
      { transaction }
    );

    const tx = await Transaction.findOne({
      where: {
        payment_id: payment.id
      },
      transaction
    });

    if (tx) {
      await tx.update(
        {
          status: mappedStatus,
          paid_at: mappedStatus === "success" ? new Date() : tx.paid_at
        },
        { transaction }
      );
    }

    const orderStatus = mappedStatus === "success" ? "paid" : mappedStatus === "expired" ? "cancelled" : "pending";

    await Order.update(
      {
        status: orderStatus
      },
      {
        where: {
          id: orderId
        },
        transaction
      }
    );

    // ── SISTEM POIN: berikan poin otomatis saat pembayaran sukses ──
    // Aturan: setiap Rp 10.000 = 1 poin (ubah POINTS_PER_10K sesuai kebijakan bisnis)
    if (mappedStatus === "success") {
      const paidOrder = await Order.findOne({ where: { id: orderId }, transaction });
      if (paidOrder) {
        const POINTS_PER_10K = 1;
        const pointsEarned = Math.floor(Number(paidOrder.total_price) / 10000) * POINTS_PER_10K;
        if (pointsEarned > 0) {
          await User.increment("points", {
            by: pointsEarned,
            where: { id: paidOrder.user_id },
            transaction
          });
        }
      }
    }
  });

  return successResponse(res, "Notifikasi Midtrans berhasil diproses.");
});

export const confirmManualPayment = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    where: {
      id: req.params.orderId,
      user_id: req.user.id
    }
  });

  if (!order) {
    return errorResponse(res, "Order tidak ditemukan.", 404);
  }

  if (order.status === "paid") {
    return successResponse(res, "Pembayaran sudah dikonfirmasi.", {
      orderId: order.id,
      orderStatus: "paid",
      paymentStatus: "success"
    });
  }

  const paidAt = new Date();
  const amount = Number(order.total_price);

  await sequelize.transaction(async (transaction) => {
    let payment = await Payment.findOne({
      where: {
        order_id: order.id
      },
      transaction
    });

    if (!payment) {
      payment = await Payment.create(
        {
          order_id: order.id,
          midtrans_token: null,
          redirect_url: null,
          qr_url: null,
          status: "success",
          expired_at: new Date(Date.now() + 15 * 60 * 1000)
        },
        { transaction }
      );
    } else {
      await payment.update(
        {
          status: "success"
        },
        { transaction }
      );
    }

    const [paymentTransaction, created] = await Transaction.findOrCreate({
      where: {
        payment_id: payment.id
      },
      defaults: {
        order_id: order.id,
        payment_id: payment.id,
        amount,
        status: "success",
        paid_at: paidAt
      },
      transaction
    });

    if (!created) {
      await paymentTransaction.update(
        {
          amount,
          status: "success",
          paid_at: paidAt
        },
        { transaction }
      );
    }

    await order.update(
      {
        status: "paid"
      },
      { transaction }
    );

    // ── SISTEM POIN: berikan poin otomatis saat konfirmasi manual ──
    const POINTS_PER_10K = 1;
    const pointsEarned = Math.floor(amount / 10000) * POINTS_PER_10K;
    if (pointsEarned > 0) {
      await User.increment("points", {
        by: pointsEarned,
        where: { id: order.user_id },
        transaction
      });
    }
  });

  // Ambil ulang user untuk dapatkan poin terbaru
  const updatedUser = await User.findByPk(order.user_id, { attributes: ["id", "points"] });

  return successResponse(res, "Pembayaran berhasil dikonfirmasi.", {
    orderId: order.id,
    orderStatus: "paid",
    paymentStatus: "success",
    amount,
    paid_at: paidAt,
    pointsEarned: Math.floor(amount / 10000),
    totalPoints: updatedUser?.points ?? 0
  });
});

export const getPaymentStatus = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    where: {
      id: req.params.orderId,
      user_id: req.user.id
    },
    include: [
      {
        model: Payment,
        as: "payment",
        include: [{ model: Transaction, as: "transaction" }]
      }
    ]
  });

  if (!order) {
    return errorResponse(res, "Order tidak ditemukan.", 404);
  }

  return successResponse(res, "Status pembayaran berhasil diambil.", {
    orderId: order.id,
    orderStatus: order.status,
    paymentStatus: order.payment?.status || null,
    transactionStatus: order.payment?.transaction?.status || null,
    expired_at: order.payment?.expired_at || null
  });
});
