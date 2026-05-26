import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";
import { User } from "../models/index.js";
import { errorResponse } from "../utils/apiResponse.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse(res, "Token tidak ditemukan.", 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return errorResponse(res, "User tidak ditemukan.", 401);
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone
    };

    return next();
  } catch (error) {
    return errorResponse(res, "Token tidak valid atau sudah kedaluwarsa.", 401);
  }
};

export default authMiddleware;
