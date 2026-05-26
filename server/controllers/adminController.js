import { Op, fn, col, literal } from "sequelize";
import sequelize from "../config/db.js";
import { User, Product, Order, OrderItem, Payment, Transaction } from "../models/index.js";
import asyncHandler from "../utils/asyncHandler.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

const getDateRange = (startDate, endDate) => {
  const where = {};

  if (startDate || endDate) {
    where[Op.between] = [
      startDate ? new Date(startDate) : new Date("1970-01-01"),
      endDate ? new Date(endDate) : new Date()
    ];
  }

  return where;
};

export const getDashboardSummary = asyncHandler(async (req, res) => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [revenueToday, revenueMonth, totalOrders, totalCustomers, topProducts, activeProducts] = await Promise.all([
    Order.sum("total_price", {
      where: {
        status: "paid",
        created_at: {
          [Op.gte]: todayStart
        }
      }
    }),
    Order.sum("total_price", {
      where: {
        status: "paid",
        created_at: {
          [Op.gte]: monthStart
        }
      }
    }),
    Order.count({
      where: {
        created_at: {
          [Op.gte]: monthStart
        }
      }
    }),
    User.count({
      where: {
        role: "member"
      }
    }),
    OrderItem.findAll({
      attributes: [
        "product_id",
        [fn("SUM", col("quantity")), "totalSold"]
      ],
      include: [{ model: Product, as: "product", attributes: ["id", "name"] }],
      group: ["product_id", "product.id"],
      order: [[literal("totalSold"), "DESC"]],
      limit: 1
    }),
    Product.count({
      where: {
        is_active: true
      }
    })
  ]);

  return successResponse(res, "Summary dashboard berhasil diambil.", {
    revenueToday: revenueToday || 0,
    revenueMonth: revenueMonth || 0,
    totalOrders,
    totalCustomers,
    totalMembers: totalCustomers,
    activeProducts,
    topProduct: topProducts[0]?.product || null
  });
});

export const getAdminTransactions = asyncHandler(async (req, res) => {
  const { startDate, endDate, status, search } = req.query;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
  const offset = (page - 1) * limit;
  const where = {};
  const userWhere = {};

  if (status) {
    where.status = status;
  }

  if (startDate || endDate) {
    where.created_at = getDateRange(startDate, endDate);
  }

  if (search) {
    userWhere.name = {
      [Op.like]: `%${search}%`
    };
  }

  const { rows, count } = await Order.findAndCountAll({
    where,
    include: [
      { model: User, as: "user", where: userWhere, attributes: ["id", "name", "email", "phone"] },
      { model: Payment, as: "payment" },
      {
        model: OrderItem,
        as: "items",
        include: [{ model: Product, as: "product" }]
      }
    ],
    order: [["created_at", "DESC"]],
    limit,
    offset,
    distinct: true
  });

  return successResponse(res, "Transaksi berhasil diambil.", {
    data: rows,
    total: count,
    page,
    totalPages: Math.ceil(count / limit)
  });
});

export const getAdminTransactionDetail = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id, {
    include: [
      { model: User, as: "user", attributes: ["id", "name", "email", "phone", "created_at"] },
      {
        model: OrderItem,
        as: "items",
        include: [{ model: Product, as: "product" }]
      },
      { model: Payment, as: "payment", include: [{ model: Transaction, as: "transaction" }] }
    ]
  });

  if (!order) {
    return errorResponse(res, "Transaksi tidak ditemukan.", 404);
  }

  return successResponse(res, "Detail transaksi berhasil diambil.", order);
});

export const updateTransactionStatus = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id);

  if (!order) {
    return errorResponse(res, "Order tidak ditemukan.", 404);
  }

  await order.update({
    status: req.body.status
  });

  return successResponse(res, "Status order berhasil diperbarui.", order);
});

export const getSalesReport = asyncHandler(async (req, res) => {
  const period = req.query.period || "daily";
  const formatter = {
    daily: "%Y-%m-%d",
    weekly: "%x-W%v",
    monthly: "%Y-%m"
  }[period] || "%Y-%m-%d";

  const rows = await Order.findAll({
    attributes: [
      [fn("DATE_FORMAT", col("created_at"), formatter), "label"],
      [fn("SUM", col("total_price")), "total"],
      [fn("COUNT", col("id")), "count"]
    ],
    where: {
      status: "paid"
    },
    group: [literal("label")],
    order: [[literal("label"), "ASC"]]
  });

  return successResponse(res, "Laporan penjualan berhasil diambil.", rows);
});

export const getFinanceReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const createdAtFilter = getDateRange(startDate, endDate);
  const dateWhere = Object.keys(createdAtFilter).length > 0 ? { created_at: createdAtFilter } : {};

  const [grossRevenue, productRevenue, membershipRevenue, paidOrders, pendingOrders, failedOrders, transactionCount] =
    await Promise.all([
      Order.sum("total_price", {
        where: {
          status: "paid",
          ...dateWhere
        }
      }),
      Order.sum("total_price", {
        where: {
          status: "paid",
          order_type: "product",
          ...dateWhere
        }
      }),
      Order.sum("total_price", {
        where: {
          status: "paid",
          order_type: "membership",
          ...dateWhere
        }
      }),
      Order.count({
        where: {
          status: "paid",
          ...dateWhere
        }
      }),
      Order.count({
        where: {
          status: "pending",
          ...dateWhere
        }
      }),
      Order.count({
        where: {
          status: "cancelled",
          ...dateWhere
        }
      }),
      Transaction.count({
        where: {
          status: "success"
        }
      })
    ]);

  const revenue = grossRevenue || 0;
  const averageOrderValue = paidOrders > 0 ? Math.round(revenue / paidOrders) : 0;

  return successResponse(res, "Laporan keuangan berhasil diambil.", {
    grossRevenue: revenue,
    productRevenue: productRevenue || 0,
    membershipRevenue: membershipRevenue || 0,
    paidOrders,
    pendingOrders,
    failedOrders,
    transactionCount,
    averageOrderValue,
    netRevenue: revenue
  });
});

export const getCustomers = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const where = {
    role: "member"
  };

  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } }
    ];
  }

  const customers = await User.findAll({
    where,
    attributes: [
      "id",
      "name",
      "email",
      "phone",
      "points",       // ← Loyalty points
      "created_at",
      [fn("COUNT", col("orders.id")), "totalOrders"],
      [fn("COALESCE", fn("SUM", literal("CASE WHEN orders.status = 'paid' THEN orders.total_price ELSE 0 END")), 0), "totalSpent"]
    ],
    include: [
      {
        model: Order,
        as: "orders",
        attributes: []
      }
    ],
    group: ["User.id"],
    order: [["created_at", "DESC"]]
  });

  return successResponse(res, "Member berhasil diambil.", customers);
});

export const getBestSellingProducts = asyncHandler(async (req, res) => {
  const rows = await OrderItem.findAll({
    attributes: [
      "product_id",
      [fn("SUM", col("quantity")), "totalSold"],
      [fn("SUM", literal("quantity * OrderItem.price")), "totalRevenue"]
    ],
    include: [{ model: Product, as: "product", attributes: ["id", "name"] }],
    group: ["product_id", "product.id"],
    order: [[literal("totalSold"), "DESC"]],
    limit: 10
  });

  return successResponse(res, "Produk terlaris berhasil diambil.", rows);
});

// ============================================================
// Admin: Update poin member secara manual
// PUT /api/admin/members/:id/points
// Body: { points: number, mode: "set" | "add" | "subtract" }
// ============================================================
export const updateMemberPoints = asyncHandler(async (req, res) => {
  const { points, mode = "set" } = req.body;
  const userId = req.params.id;

  if (typeof points !== "number" || points < 0 || !Number.isInteger(points)) {
    return errorResponse(res, "Nilai poin harus berupa bilangan bulat non-negatif.", 422);
  }

  const member = await User.findOne({ where: { id: userId, role: "member" } });
  if (!member) {
    return errorResponse(res, "Member tidak ditemukan.", 404);
  }

  if (mode === "add") {
    await member.increment("points", { by: points });
  } else if (mode === "subtract") {
    const newPoints = Math.max(0, member.points - points);
    await member.update({ points: newPoints });
  } else {
    // mode "set" — set langsung
    await member.update({ points });
  }

  await member.reload();
  return successResponse(res, `Poin member berhasil diperbarui menjadi ${member.points}.`, {
    id: member.id,
    name: member.name,
    points: member.points
  });
});

// ============================================================
// Admin: Status & konfigurasi Payment Gateway (Duitku)
// ============================================================
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filenameAdmin = fileURLToPath(import.meta.url);
const __dirnameAdmin  = path.dirname(__filenameAdmin);
const ENV_PATH        = path.resolve(__dirnameAdmin, "../.env");

export const getPaymentGatewayStatus = asyncHandler(async (req, res) => {
  const configured = Boolean(
    process.env.DUITKU_MERCHANT_CODE && process.env.DUITKU_API_KEY
  );
  return successResponse(res, "Status payment gateway.", {
    provider:    "duitku",
    configured,
    env:         process.env.DUITKU_ENV || "sandbox",
    currentConfig: {
      DUITKU_MERCHANT_CODE: process.env.DUITKU_MERCHANT_CODE || "",
      DUITKU_API_KEY:       process.env.DUITKU_API_KEY ? "***tersimpan***" : "",
      DUITKU_CALLBACK_URL:  process.env.DUITKU_CALLBACK_URL || "",
      DUITKU_RETURN_URL:    process.env.DUITKU_RETURN_URL || "",
      DUITKU_ENV:           process.env.DUITKU_ENV || "sandbox",
    },
  });
});

export const savePaymentGatewayConfig = asyncHandler(async (req, res) => {
  const {
    DUITKU_MERCHANT_CODE, DUITKU_API_KEY,
    DUITKU_CALLBACK_URL, DUITKU_RETURN_URL, DUITKU_ENV,
  } = req.body;

  if (!DUITKU_MERCHANT_CODE || !DUITKU_API_KEY) {
    return errorResponse(res, "Merchant Code dan API Key wajib diisi.", 422);
  }

  // Baca .env yang ada, update / tambah keys Duitku
  let envContent = "";
  try { envContent = fs.readFileSync(ENV_PATH, "utf-8"); } catch { envContent = ""; }

  const updates = {
    DUITKU_MERCHANT_CODE,
    DUITKU_API_KEY,
    DUITKU_CALLBACK_URL: DUITKU_CALLBACK_URL || "",
    DUITKU_RETURN_URL:   DUITKU_RETURN_URL   || "",
    DUITKU_ENV:          DUITKU_ENV || "sandbox",
  };

  for (const [key, value] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*$`, "m");
    const line  = `${key}=${value}`;
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, line);
    } else {
      envContent += `\n${line}`;
    }
    // Update process.env langsung agar berlaku tanpa restart (partial)
    process.env[key] = value;
  }

  fs.writeFileSync(ENV_PATH, envContent.trim() + "\n");
  return successResponse(res, "Konfigurasi Duitku berhasil disimpan. Restart server untuk menerapkan sepenuhnya.");
});

export const testDuitkuConnection = asyncHandler(async (req, res) => {
  const merchantCode = process.env.DUITKU_MERCHANT_CODE;
  const apiKey       = process.env.DUITKU_API_KEY;

  if (!merchantCode || !apiKey) {
    return errorResponse(res, "Merchant Code atau API Key belum diisi.", 422);
  }

  const { createSignature, DUITKU_CONFIG } = await import("../config/duitku.js");
  const datetime  = new Date().toISOString().replace("T", " ").substring(0, 19);
  const signature = require("crypto")
    .createHash("md5")
    .update(`${merchantCode}55000${datetime}${apiKey}`)
    .digest("hex");

  try {
    const testRes = await fetch(`${DUITKU_CONFIG.baseUrl}/merchant/paymentmethod/getpaymentmethod`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ merchantcode: merchantCode, amount: 55000, datetime, signature }),
    });

    if (testRes.ok) {
      return successResponse(res, "Koneksi Duitku berhasil!", { message: "Merchant Code & API Key valid." });
    } else {
      const text = await testRes.text();
      return errorResponse(res, `Duitku menolak request: ${text}`, 422);
    }
  } catch (err) {
    return errorResponse(res, `Gagal menghubungi Duitku: ${err.message}`, 502);
  }
});
