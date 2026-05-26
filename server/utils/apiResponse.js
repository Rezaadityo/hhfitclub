export const sendResponse = (res, statusCode, success, message, data = null) => {
  return res.status(statusCode).json({
    success,
    message,
    data
  });
};

export const successResponse = (res, message, data = null, statusCode = 200) => {
  return sendResponse(res, statusCode, true, message, data);
};

export const errorResponse = (res, message, statusCode = 500, data = null) => {
  return sendResponse(res, statusCode, false, message, data);
};
