import express from "express";
import { body } from "express-validator";
import { createOrder, getOrderById, getOrders } from "../controllers/orderController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import validateRequest from "../middlewares/validateRequest.js";

const router = express.Router();

const orderRules = [
  body().custom((value, { req }) => {
    const hasProductItems = Array.isArray(req.body.items) && req.body.items.length > 0;
    const hasMembership = Boolean(req.body.membershipId);

    if (!hasProductItems && !hasMembership) {
      throw new Error("Items atau membershipId wajib diisi.");
    }

    return true;
  }),
  body("items").optional().isArray({ min: 1 }).withMessage("Items wajib berupa array."),
  body("items.*.productId").optional().isInt({ min: 1 }).withMessage("Product ID tidak valid."),
  body("items.*.quantity").optional().isInt({ min: 1 }).withMessage("Quantity minimal 1."),
  body("membershipId").optional().isInt({ min: 1 }).withMessage("Membership ID tidak valid.")
];

router.use(authMiddleware);
router.post("/", orderRules, validateRequest, createOrder);
router.get("/", getOrders);
router.get("/:id", getOrderById);

export default router;
