import { validationResult } from "express-validator";
import { errorResponse } from "../utils/apiResponse.js";

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return errorResponse(res, "Validasi gagal.", 422, errors.array());
  }

  return next();
};

export default validateRequest;
