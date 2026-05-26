import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || "hhfitclub",
  process.env.DB_USER || "root",
  process.env.DB_PASS || "",
  {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    dialect: "mysql",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    define: {
      underscored: true,
      timestamps: false
    },
    dialectOptions: {
      decimalNumbers: true
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
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
          `Host: ${process.env.DB_HOST || "127.0.0.1"}`,
          `Port: ${process.env.DB_PORT || 3306}`,
          "Pastikan MySQL di XAMPP/Laragon sudah Start dan DB_PORT di .env sesuai port MySQL."
        ].join("\n")
      );
    } else {
      console.error("Unable to connect to the database:", error.message);
    }
    throw error;
  }
};

export default sequelize;
