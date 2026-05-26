// ============================================================
// FILE: server/config/duitku.js
// Duitku Payment Gateway — konfigurasi & helper fungsi
// Docs: https://docs.duitku.com
// ============================================================
import crypto from "crypto";

export const DUITKU_CONFIG = {
  merchantCode: process.env.DUITKU_MERCHANT_CODE || "",
  apiKey:       process.env.DUITKU_API_KEY || "",
  // Ganti ke https://passport.duitku.com untuk PRODUCTION
  baseUrl:      process.env.DUITKU_ENV === "production"
                  ? "https://passport.duitku.com/webapi/api"
                  : "https://sandbox.duitku.com/webapi/api",
  callbackUrl:  process.env.DUITKU_CALLBACK_URL || "http://localhost:5000/api/duitku/callback",
  returnUrl:    process.env.DUITKU_RETURN_URL    || "http://localhost:5173/order-success",
  isProduction: process.env.DUITKU_ENV === "production",
};

// Buat signature untuk request ke Duitku
export const createSignature = (merchantCode, merchantOrderId, paymentAmount, apiKey) => {
  const raw = `${merchantCode}${merchantOrderId}${paymentAmount}${apiKey}`;
  return crypto.createHash("md5").update(raw).digest("hex");
};

// Verifikasi signature dari callback Duitku
export const verifyCallbackSignature = (merchantCode, amount, merchantOrderId, apiKey, receivedSignature) => {
  const raw = `${merchantCode}${amount}${merchantOrderId}${apiKey}`;
  const expected = crypto.createHash("md5").update(raw).digest("hex");
  return expected === receivedSignature;
};

// Daftar payment channel Duitku yang umum digunakan
export const DUITKU_CHANNELS = [
  { code: "OV",  name: "OVO",           type: "E-Wallet" },
  { code: "DA",  name: "DANA",          type: "E-Wallet" },
  { code: "SP",  name: "ShopeePay",     type: "E-Wallet" },
  { code: "LA",  name: "LinkAja",       type: "E-Wallet" },
  { code: "BT",  name: "Permata Bank",  type: "Virtual Account" },
  { code: "B1",  name: "CIMB Niaga VA", type: "Virtual Account" },
  { code: "BV",  name: "BNI VA",        type: "Virtual Account" },
  { code: "I1",  name: "BRI VA",        type: "Virtual Account" },
  { code: "VA",  name: "Maybank VA",    type: "Virtual Account" },
  { code: "M2",  name: "Mandiri VA",    type: "Virtual Account" },
  { code: "FT",  name: "Retail (Alfamart/Indomaret)", type: "Retail" },
  { code: "QR",  name: "QRIS",          type: "QRIS" },
  { code: "IR",  name: "iPaymu QRIS",   type: "QRIS" },
];
