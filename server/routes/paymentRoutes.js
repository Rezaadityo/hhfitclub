import express from "express";
import { confirmManualPayment, createPayment, getPaymentStatus, handleNotification } from "../controllers/paymentController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/notification", handleNotification);
router.post("/create/:orderId", authMiddleware, createPayment);
router.post("/confirm/:orderId", authMiddleware, confirmManualPayment);
router.get("/status/:orderId", authMiddleware, getPaymentStatus);

export default router;
