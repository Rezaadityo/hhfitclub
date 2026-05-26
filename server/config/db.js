import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME     || "railway",
  process.env.DB_USER     || "root",
  // Support DB_PASSWORD (Railway convention) DAN DB_PASS (local convention)
  process.env.DB_PASSWORD || process.env.DB_PASS || "",
  {
    host:    process.env.DB_HOST || "127.0.0.1",
    port:    Number(process.env.DB_PORT || 3306),
    dialect: "mysql",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    define: {
      underscored: true,
      timestamps:  false
    },
    dialectOptions: {
      decimalNumbers: true,
      // SSL wajib untuk Railway MySQL
      ssl: process.env.DB_HOST?.includes("railway.app") ||
           process.env.DB_HOST?.includes("rlwy.net")
        ? { rejectUnauthorized: false }
        : false
    },
    pool: {
      max:     10,
      min:     0,
      acquire: 30000,
      idle:    10000
    }
  }
);

export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");
  } catch (error) {
    if (error.original?.code === "ECONNREFUSED") {
      console.error(
        [
          "MySQL tidak bisa dihubungi.",
          `Host: ${process.env.DB_HOST}`,
          `Port: ${process.env.DB_PORT}`,
          "Pastikan DB_HOST, DB_PORT, DB_USER, DB_PASSWORD sudah benar di .env"
        ].join("\n")
      );
    } else {
      console.error("Unable to connect to the database:", error.message);
    }
    throw error;
  }
};

export default sequelize;
