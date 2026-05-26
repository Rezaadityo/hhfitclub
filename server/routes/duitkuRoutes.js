// ============================================================
// FILE: server/routes/duitkuRoutes.js
// ============================================================
import express from "express";
import {
  createDuitkuPayment,
  handleDuitkuCallback,
  getDuitkuPaymentStatus,
  getDuitkuChannels,
} from "../controllers/duitkuController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Webhook dari Duitku — TIDAK perlu auth (server-to-server)
router.post("/callback", handleDuitkuCallback);

// Endpoint yang butuh auth member
router.post("/create/:orderId",  authMiddleware, createDuitkuPayment);
router.get("/status/:orderId",   authMiddleware, getDuitkuPaymentStatus);
router.get("/channels",          authMiddleware, getDuitkuChannels);

export default router;
