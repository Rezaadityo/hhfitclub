import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { isUsingDefaultJwtSecret } from "./config/env.js";
import { testConnection } from "./config/db.js";
import { ensureSchema } from "./config/ensureSchema.js";
import "./models/index.js";
import apiRoutes from "./routes/index.js";

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Terlalu banyak request. Silakan coba lagi nanti.", data: null }
});

const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
};

app.use(cors(corsOptions));

// Helmet: longgarkan CSP agar gambar dari domain sendiri bisa dimuat
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // ← FIX: izinkan gambar dimuat lintas origin
    contentSecurityPolicy: false
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// FIX: Serve static files dengan header CORS eksplisit
app.use("/uploads", (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", process.env.CLIENT_URL || "http://localhost:5173");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
}, express.static("public/uploads"));

app.use(limiter);

app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "HH FIT CLUB API is running.", data: { service: "hhfitclub-server" } });
});

app.use("/api", apiRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Endpoint tidak ditemukan.", data: null });
});

app.use((error, req, res, next) => {
  console.error(error);
  const statusCode = error.statusCode || error.status || 500;
  res.status(statusCode).json({ success: false, message: error.message || "Terjadi kesalahan pada server.", data: null });
});

const startServer = async () => {
  await testConnection();
  await ensureSchema();

  if (isUsingDefaultJwtSecret) {
    console.warn("JWT_SECRET tidak ditemukan di .env. Menggunakan secret development lokal.");
  }

  app.listen(PORT, () => {
    console.log(`HH FIT CLUB API listening on port ${PORT}`);
  });
};

if (process.env.NODE_ENV !== "test") {
  startServer().catch((error) => {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  });
}

export default app;
