import { Op } from "sequelize";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { Product } from "../models/index.js";
import asyncHandler from "../utils/asyncHandler.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const uploadDir  = path.resolve(__dirname, "../public/uploads/products");

// ── Simpan gambar ke local disk, return URL yang bisa diakses browser ──
const saveToLocalUploads = async (req, file) => {
  await fs.mkdir(uploadDir, { recursive: true });

  const extension = path.extname(file.originalname).toLowerCase() || ".jpg";
  const filename  = `${Date.now()}-${randomUUID()}${extension}`;
  const filepath  = path.join(uploadDir, filename);

  await fs.writeFile(filepath, file.buffer);

  // FIX: Gunakan BACKEND_URL dari .env agar URL tidak putus di production/deploy
  // Fallback ke req.protocol + host untuk development lokal
  const baseUrl = process.env.BACKEND_URL
    ? process.env.BACKEND_URL.replace(/\/$/, "")
    : `${req.protocol}://${req.get("host")}`;

  return `${baseUrl}/uploads/products/${filename}`;
};

// ── Upload gambar produk ──
// Hanya gunakan local disk (Cloudinary dihapus agar tidak membingungkan)
const uploadProductImage = async (req) => {
  if (!req.file) return null;
  return saveToLocalUploads(req, req.file);
};

// ============================================================
export const getProducts = asyncHandler(async (req, res) => {
  const { category, search } = req.query;
  const page   = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit  = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 50);
  const offset = (page - 1) * limit;
  const where  = { is_active: true };

  if (category) where.category = category;
  if (search)   where.name = { [Op.like]: `%${search}%` };

  const { rows, count } = await Product.findAndCountAll({ where, limit, offset, order: [["id", "DESC"]] });

  return successResponse(res, "Produk berhasil diambil.", {
    data: rows, total: count, page, totalPages: Math.ceil(count / limit)
  });
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ where: { id: req.params.id, is_active: true } });
  if (!product) return errorResponse(res, "Produk tidak ditemukan.", 404);
  return successResponse(res, "Detail produk berhasil diambil.", product);
});

export const getAdminProducts = asyncHandler(async (req, res) => {
  const page   = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit  = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
  const offset = (page - 1) * limit;

  const { rows, count } = await Product.findAndCountAll({
    where: { is_active: true }, limit, offset, order: [["id", "DESC"]]
  });

  return successResponse(res, "Data produk admin berhasil diambil.", {
    data: rows, total: count, page, totalPages: Math.ceil(count / limit)
  });
});

export const createProduct = asyncHandler(async (req, res) => {
  const { name, category, description, price, stock } = req.body;
  const imageUrl = await uploadProductImage(req);

  const product = await Product.create({ name, category, description, price, stock, image_url: imageUrl });
  return successResponse(res, "Produk berhasil dibuat.", product, 201);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return errorResponse(res, "Produk tidak ditemukan.", 404);

  // Hanya ganti image_url kalau ada file baru yang diupload
  const imageUrl = req.file ? await uploadProductImage(req) : product.image_url;

  await product.update({
    name:        req.body.name        ?? product.name,
    category:    req.body.category    ?? product.category,
    description: req.body.description ?? product.description,
    price:       req.body.price       ?? product.price,
    stock:       req.body.stock       ?? product.stock,
    is_active:   req.body.is_active   ?? product.is_active,
    image_url:   imageUrl,
  });

  return successResponse(res, "Produk berhasil diperbarui.", product);
});

export const updateProductStock = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return errorResponse(res, "Produk tidak ditemukan.", 404);

  const stock     = req.body.stock;
  const addStock  = req.body.addStock;
  const nextStock = stock !== undefined
    ? Number(stock)
    : Number(product.stock) + Number(addStock || 0);

  if (!Number.isInteger(nextStock) || nextStock < 0) {
    return errorResponse(res, "Stok tidak valid.", 422);
  }

  await product.update({ stock: nextStock });
  return successResponse(res, "Stok produk berhasil diperbarui.", product);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return errorResponse(res, "Produk tidak ditemukan.", 404);
  await product.update({ is_active: false });
  return successResponse(res, "Produk berhasil dinonaktifkan.", product);
});
