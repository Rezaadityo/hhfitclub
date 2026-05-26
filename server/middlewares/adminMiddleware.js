import { errorResponse } from "../utils/apiResponse.js";

const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return errorResponse(res, "Akses ditolak. Admin only.", 403);
  }

  return next();
};

export default adminMiddleware;
