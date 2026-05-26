import express from "express";
import { body } from "express-validator";
import {
  getAdminTransactionDetail,
  getAdminTransactions,
  getBestSellingProducts,
  getCustomers,
  getDashboardSummary,
  getFinanceReport,
  getSalesReport,
  updateTransactionStatus,
  updateMemberPoints,
  getPaymentGatewayStatus,
  savePaymentGatewayConfig,
  testDuitkuConnection,
} from "../controllers/adminController.js";
import {
  createMembership,
  deleteMembership,
  getAdminMemberships,
  updateMembership
} from "../controllers/membershipController.js";
import {
  createProduct,
  deleteProduct,
  getAdminProducts,
  updateProductStock,
  updateProduct
} from "../controllers/productController.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import validateRequest from "../middlewares/validateRequest.js";

const router = express.Router();

const productRules = [
  body("name").optional().trim().isLength({ min: 2 }).withMessage("Nama produk minimal 2 karakter."),
  body("category").optional().isIn(["minuman_sehat", "minuman_energi", "suplemen"]).withMessage("Kategori produk tidak valid."),
  body("price").optional().isInt({ min: 0 }).withMessage("Harga tidak valid."),
  body("stock").optional().isInt({ min: 0 }).withMessage("Stok tidak valid.")
];

const membershipRules = [
  body("name").optional().trim().isLength({ min: 2 }).withMessage("Nama membership minimal 2 karakter."),
  body("duration_days").optional().isInt({ min: 1 }).withMessage("Durasi minimal 1 hari."),
  body("price").optional().isInt({ min: 0 }).withMessage("Harga tidak valid."),
  body("benefits").optional().trim().notEmpty().withMessage("Benefits wajib diisi.")
];

router.use(authMiddleware, adminMiddleware);

router.get("/dashboard/summary", getDashboardSummary);
router.get("/transactions", getAdminTransactions);
router.get("/transactions/:id", getAdminTransactionDetail);
router.put(
  "/transactions/:id/status",
  body("status").isIn(["pending", "paid", "cancelled", "processing"]).withMessage("Status order tidak valid."),
  validateRequest,
  updateTransactionStatus
);
router.get("/reports/sales", getSalesReport);
router.get("/reports/finance", getFinanceReport);
router.get("/reports/best-products", getBestSellingProducts);
router.get("/customers", getCustomers);
router.get("/members", getCustomers);

router.get("/products", getAdminProducts);
router.post("/products", upload.single("image"), productRules, validateRequest, createProduct);
router.put("/products/:id", upload.single("image"), productRules, validateRequest, updateProduct);
router.patch(
  "/products/:id/stock",
  body("stock").optional().isInt({ min: 0 }).withMessage("Stok tidak valid."),
  body("addStock").optional().isInt().withMessage("Tambahan stok tidak valid."),
  validateRequest,
  updateProductStock
);
router.delete("/products/:id", deleteProduct);

router.get("/memberships", getAdminMemberships);
router.post("/memberships", membershipRules, validateRequest, createMembership);
router.put("/memberships/:id", membershipRules, validateRequest, updateMembership);
router.delete("/memberships/:id", deleteMembership);

// Manajemen poin member
router.put(
  "/members/:id/points",
  body("points").isInt({ min: 0 }).withMessage("Poin harus bilangan bulat non-negatif."),
  body("mode").optional().isIn(["set", "add", "subtract"]).withMessage("Mode tidak valid."),
  validateRequest,
  updateMemberPoints
);

// Payment Gateway management
router.get("/payment-gateway/status",  getPaymentGatewayStatus);
router.post("/payment-gateway/config", savePaymentGatewayConfig);
router.post("/payment-gateway/test",   testDuitkuConnection);

export default router;
