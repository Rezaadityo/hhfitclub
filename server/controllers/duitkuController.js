// ============================================================
// FILE: server/controllers/duitkuController.js
// Semua logika Duitku: buat transaksi, callback, cek status
// ============================================================
import sequelize from "../config/db.js";
import { DUITKU_CONFIG, createSignature, verifyCallbackSignature } from "../config/duitku.js";
import { Order, OrderItem, Product, Payment, Transaction, User, Membership } from "../models/index.js";
import asyncHandler from "../utils/asyncHandler.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

// ── Helper: panggil API Duitku ──
async function callDuitku(endpoint, body) {
  const url = `${DUITKU_CONFIG.baseUrl}${endpoint}`;
  const res  = await fetch(url, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw Object.assign(new Error(`Duitku API error ${res.status}: ${text}`), { statusCode: 502 });
  }

  return res.json();
}

// ── 1. Buat transaksi baru ke Duitku ──
export const createDuitkuPayment = asyncHandler(async (req, res) => {
  if (!DUITKU_CONFIG.merchantCode || !DUITKU_CONFIG.apiKey) {
    return errorResponse(res, "Duitku belum dikonfigurasi. Isi DUITKU_MERCHANT_CODE dan DUITKU_API_KEY di .env", 503);
  }

  const order = await Order.findOne({
    where: { id: req.params.orderId, user_id: req.user.id },
    include: [
      { model: OrderItem, as: "items", include: [{ model: Product, as: "product" }] },
      { model: User,      as: "user" },
      { model: Membership, as: "membership" },
    ],
  });

  if (!order)                return errorResponse(res, "Order tidak ditemukan.", 404);
  if (order.status === "paid") return errorResponse(res, "Order sudah dibayar.", 409);

  const paymentMethod    = req.body.paymentMethod || "QR"; // default QRIS
  const grossAmount      = Number(order.total_price);
  const merchantOrderId  = `HHFIT-${order.id}-${Date.now()}`;
  const expiryMinutes    = 60;

  // Buat item detail untuk Duitku
  const itemDetails = order.order_type === "membership"
    ? [{ name: `Membership ${order.membership?.name || "HH FIT CLUB"}`, price: grossAmount, quantity: 1 }]
    : order.items.map((item) => ({
        name:     item.product.name.substring(0, 255),
        price:    Number(item.price),
        quantity: Number(item.quantity),
      }));

  const signature = createSignature(
    DUITKU_CONFIG.merchantCode,
    merchantOrderId,
    String(grossAmount),
    DUITKU_CONFIG.apiKey
  );

  const payload = {
    merchantCode:    DUITKU_CONFIG.merchantCode,
    paymentAmount:   grossAmount,
    paymentMethod,
    merchantOrderId,
    productDetails:  itemDetails.map((i) => i.name).join(", ").substring(0, 255),
    additionalParam: "",
    merchantUserInfo: order.user.email,
    customerVaName:  order.user.name.substring(0, 20),
    email:           order.user.email,
    phoneNumber:     order.user.phone || "",
    itemDetails,
    customerDetail: {
      firstName: order.user.name,
      email:     order.user.email,
      phoneNumber: order.user.phone || "",
    },
    callbackUrl:  DUITKU_CONFIG.callbackUrl,
    returnUrl:    `${DUITKU_CONFIG.returnUrl}/${order.id}`,
    signature,
    expiryPeriod: expiryMinutes,
  };

  let duitkuResponse;
  try {
    duitkuResponse = await callDuitku("/merchant/v2/inquiry", payload);
  } catch (err) {
    return errorResponse(res, `Gagal menghubungi Duitku: ${err.message}`, 502);
  }

  if (duitkuResponse.statusCode !== "00") {
    return errorResponse(res, `Duitku menolak transaksi: ${duitkuResponse.statusMessage}`, 422);
  }

  const expiredAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  // Simpan ke tabel payments & transactions
  await sequelize.transaction(async (t) => {
    const [payment, created] = await Payment.findOrCreate({
      where: { order_id: order.id },
      defaults: {
        order_id:       order.id,
        midtrans_token: duitkuResponse.reference,   // pakai kolom midtrans_token untuk ref Duitku
        redirect_url:   duitkuResponse.paymentUrl,
        qr_url:         duitkuResponse.qrString || duitkuResponse.paymentUrl || null,
        status:         "pending",
        expired_at:     expiredAt,
      },
      transaction: t,
    });

    if (!created) {
      await payment.update({
        midtrans_token: duitkuResponse.reference,
        redirect_url:   duitkuResponse.paymentUrl,
        qr_url:         duitkuResponse.qrString || duitkuResponse.paymentUrl || null,
        status:         "pending",
        expired_at:     expiredAt,
      }, { transaction: t });
    }

    const [tx] = await Transaction.findOrCreate({
      where:    { payment_id: payment.id },
      defaults: { order_id: order.id, payment_id: payment.id, amount: grossAmount, status: "pending" },
      transaction: t,
    });

    if (tx && tx.status !== "pending") {
      await tx.update({ status: "pending", paid_at: null, amount: grossAmount }, { transaction: t });
    }
  });

  return successResponse(res, "Transaksi Duitku berhasil dibuat.", {
    paymentUrl:      duitkuResponse.paymentUrl,
    reference:       duitkuResponse.reference,
    vaNumber:        duitkuResponse.vaNumber        || null,
    qrString:        duitkuResponse.qrString        || null,
    amount:          grossAmount,
    expired_at:      expiredAt,
    paymentMethod,
  });
});

// ── 2. Callback dari Duitku (webhook server-to-server) ──
export const handleDuitkuCallback = asyncHandler(async (req, res) => {
  const {
    merchantCode, amount, merchantOrderId,
    productDetail, additionalParam,
    paymentMethod, resultCode, merchantUserId,
    reference, signature,
  } = req.body;

  // Verifikasi signature
  const valid = verifyCallbackSignature(
    merchantCode, amount, merchantOrderId,
    DUITKU_CONFIG.apiKey, signature
  );

  if (!valid) {
    console.warn("Duitku callback: signature tidak valid", req.body);
    return res.status(400).send("Bad signature");
  }

  // Parse order ID dari merchantOrderId format HHFIT-{id}-{timestamp}
  const match   = String(merchantOrderId).match(/^HHFIT-(\d+)-/);
  if (!match)   return res.status(400).send("Invalid order id");

  const orderId = Number(match[1]);
  // resultCode "00" = sukses
  const isSuccess = resultCode === "00";

  await sequelize.transaction(async (t) => {
    const payment = await Payment.findOne({ where: { order_id: orderId }, transaction: t });
    if (!payment) return;

    const newPayStatus  = isSuccess ? "success" : "failed";
    const newOrderStatus = isSuccess ? "paid"   : "cancelled";

    await payment.update({ status: newPayStatus }, { transaction: t });

    const tx = await Transaction.findOne({ where: { payment_id: payment.id }, transaction: t });
    if (tx) {
      await tx.update({
        status:  newPayStatus,
        paid_at: isSuccess ? new Date() : tx.paid_at,
      }, { transaction: t });
    }

    await Order.update({ status: newOrderStatus }, { where: { id: orderId }, transaction: t });

    // Beri poin jika sukses
    if (isSuccess) {
      const paidOrder = await Order.findOne({ where: { id: orderId }, transaction: t });
      if (paidOrder) {
        const pointsEarned = Math.floor(Number(paidOrder.total_price) / 10000);
        if (pointsEarned > 0) {
          await User.increment("points", { by: pointsEarned, where: { id: paidOrder.user_id }, transaction: t });
        }
      }
    }
  });

  // Duitku mengharapkan response "SUCCESS" atau body kosong
  res.status(200).send("SUCCESS");
});

// ── 3. Cek status transaksi Duitku ──
export const getDuitkuPaymentStatus = asyncHandler(async (req, res) => {
  if (!DUITKU_CONFIG.merchantCode || !DUITKU_CONFIG.apiKey) {
    return errorResponse(res, "Duitku belum dikonfigurasi.", 503);
  }

  const order = await Order.findOne({
    where: { id: req.params.orderId, user_id: req.user.id },
    include: [{ model: Payment, as: "payment", include: [{ model: Transaction, as: "transaction" }] }],
  });

  if (!order) return errorResponse(res, "Order tidak ditemukan.", 404);

  const merchantOrderId = order.payment?.midtrans_token
    ? null  // reference tersimpan di midtrans_token kolom
    : null;

  return successResponse(res, "Status pembayaran Duitku.", {
    orderId:          order.id,
    orderStatus:      order.status,
    paymentStatus:    order.payment?.status || null,
    paymentUrl:       order.payment?.redirect_url || null,
    qrString:         order.payment?.qr_url || null,
    expired_at:       order.payment?.expired_at || null,
    transactionStatus: order.payment?.transaction?.status || null,
  });
});

// ── 4. Get daftar payment channel yang tersedia ──
export const getDuitkuChannels = asyncHandler(async (req, res) => {
  if (!DUITKU_CONFIG.merchantCode || !DUITKU_CONFIG.apiKey) {
    return errorResponse(res, "Duitku belum dikonfigurasi.", 503);
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = require("crypto")
    .createHash("md5")
    .update(`${DUITKU_CONFIG.merchantCode}${timestamp}${DUITKU_CONFIG.apiKey}`)
    .digest("hex");

  try {
    const data = await callDuitku("/merchant/paymentmethod/getpaymentmethod", {
      merchantcode: DUITKU_CONFIG.merchantCode,
      amount:       req.query.amount || 10000,
      datetime:     new Date().toISOString().replace("T", " ").substring(0, 19),
      signature,
    });
    return successResponse(res, "Channel pembayaran berhasil diambil.", data);
  } catch (err) {
    return errorResponse(res, `Gagal mengambil channel: ${err.message}`, 502);
  }
});
