import express from "express";
import { getMembershipById, getMemberships } from "../controllers/membershipController.js";

const router = express.Router();

router.get("/", getMemberships);
router.get("/:id", getMembershipById);

export default router;
