import express from "express";
import { body } from "express-validator";
import { register, login, getMe, updateProfile } from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import validateRequest from "../middlewares/validateRequest.js";

const router = express.Router();

const registerRules = [
  body("name").trim().isLength({ min: 2 }).withMessage("Nama minimal 2 karakter."),
  body("email").isEmail().withMessage("Email tidak valid.").normalizeEmail(),
  body("password").isLength({ min: 8 }).withMessage("Password minimal 8 karakter."),
  body("phone").optional({ nullable: true, checkFalsy: true }).isLength({ min: 8 }).withMessage("Nomor telepon tidak valid.")
];

const loginRules = [
  body("email").isEmail().withMessage("Email tidak valid.").normalizeEmail(),
  body("password").notEmpty().withMessage("Password wajib diisi.")
];

const profileRules = [
  body("name").trim().isLength({ min: 2 }).withMessage("Nama minimal 2 karakter."),
  body("phone").optional({ nullable: true, checkFalsy: true }).isLength({ min: 8 }).withMessage("Nomor telepon tidak valid.")
];

router.post("/register", registerRules, validateRequest, register);
router.post("/login", loginRules, validateRequest, login);
router.get("/me", authMiddleware, getMe);
router.put("/profile", authMiddleware, profileRules, validateRequest, updateProfile);

export default router;
