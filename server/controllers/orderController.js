import sequelize from "../config/db.js";
import { Order, OrderItem, Product, Payment, Transaction, Membership } from "../models/index.js";
import asyncHandler from "../utils/asyncHandler.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export const createOrder = asyncHandler(async (req, res) => {
  const { items, membershipId } = req.body;

  if (membershipId) {
    const membership = await Membership.findOne({
      where: {
        id: membershipId,
        is_active: true
      }
    });

    if (!membership) {
      return errorResponse(res, "Membership tidak ditemukan atau tidak aktif.", 404);
    }

    const order = await Order.create({
      user_id: req.user.id,
      total_price: Number(membership.price),
      order_type: "membership",
      membership_id: membership.id,
      status: "pending",
      payment_method: "qris"
    });

    const orderWithMembership = await Order.findByPk(order.id, {
      include: [{ model: Membership, as: "membership" }]
    });

    return successResponse(res, "Order membership berhasil dibuat.", orderWithMembership, 201);
  }

  if (!Array.isArray(items) || items.length === 0) {
    return errorResponse(res, "Cart atau paket membership tidak boleh kosong.", 422);
  }

  const result = await sequelize.transaction(async (transaction) => {
    const productIds = items.map((item) => item.productId);
    const products = await Product.findAll({
      where: {
        id: productIds,
        is_active: true
      },
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    const productMap = new Map(products.map((product) => [product.id, product]));
    let totalPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const product = productMap.get(Number(item.productId));
      const quantity = Number(item.quantity);

      if (!product) {
        throw Object.assign(new Error("Produk tidak ditemukan atau tidak aktif."), { statusCode: 404 });
      }

      if (!Number.isInteger(quantity) || quantity < 1) {
        throw Object.assign(new Error("Quantity tidak valid."), { statusCode: 422 });
      }

      if (product.stock < quantity) {
        throw Object.assign(new Error(`Stok ${product.name} tidak cukup.`), { statusCode: 422 });
      }

      totalPrice += product.price * quantity;
      orderItems.push({
        product,
        quantity,
        price: product.price
      });
    }

    const order = await Order.create(
      {
        user_id: req.user.id,
        total_price: totalPrice,
        order_type: "product",
        status: "pending",
        payment_method: "qris"
      },
      { transaction }
    );

    for (const item of orderItems) {
      await OrderItem.create(
        {
          order_id: order.id,
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.price
        },
        { transaction }
      );

      await item.product.decrement("stock", {
        by: item.quantity,
        transaction
      });
    }

    return order;
  });

  const order = await Order.findByPk(result.id, {
    include: [
      {
        model: OrderItem,
        as: "items",
        include: [{ model: Product, as: "product" }]
      },
      {
        model: Membership,
        as: "membership"
      }
    ]
  });

  return successResponse(res, "Order berhasil dibuat.", order, 201);
});

export const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.findAll({
    where: {
      user_id: req.user.id
    },
    include: [
      {
        // Include detail item + produk agar riwayat menampilkan nama & foto produk
        model: OrderItem,
        as: "items",
        include: [{ model: Product, as: "product", attributes: ["id", "name", "price", "image_url"] }]
      },
      {
        model: Payment,
        as: "payment"
      },
      {
        model: Membership,
        as: "membership",
        attributes: ["id", "name", "duration_days"]
      }
    ],
    order: [["created_at", "DESC"]]
  });

  return successResponse(res, "Riwayat order berhasil diambil.", orders);
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    where: {
      id: req.params.id,
      user_id: req.user.id
    },
    include: [
      {
        model: OrderItem,
        as: "items",
        include: [{ model: Product, as: "product" }]
      },
      {
        model: Membership,
        as: "membership"
      },
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

  return successResponse(res, "Detail order berhasil diambil.", order);
});
