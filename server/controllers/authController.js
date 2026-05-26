import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";
import { User } from "../models/index.js";
import asyncHandler from "../utils/asyncHandler.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

const signToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    {
      expiresIn: "7d"
    }
  );
};

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  created_at: user.created_at
});

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  const existingUser = await User.scope("withPassword").findOne({ where: { email } });

  if (existingUser) {
    return errorResponse(res, "Email sudah terdaftar.", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    phone,
    role: "member"
  });

  const token = signToken(user);

  return successResponse(
    res,
    "Registrasi berhasil.",
    {
      token,
      user: sanitizeUser(user)
    },
    201
  );
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.scope("withPassword").findOne({ where: { email } });

  if (!user) {
    return errorResponse(res, "Email atau password salah.", 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return errorResponse(res, "Email atau password salah.", 401);
  }

  const token = signToken(user);

  return successResponse(res, "Login berhasil.", {
    token,
    user: sanitizeUser(user)
  });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);

  return successResponse(res, "Profil berhasil diambil.", {
    user: sanitizeUser(user)
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  const user = await User.findByPk(req.user.id);

  await user.update({
    name,
    phone
  });

  return successResponse(res, "Profil berhasil diperbarui.", {
    user: sanitizeUser(user)
  });
});
