import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Payment = sequelize.define(
  "Payment",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    order_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      unique: true
    },
    midtrans_token: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    redirect_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    qr_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    status: {
      type: DataTypes.ENUM("pending", "success", "expired", "failed"),
      allowNull: false,
      defaultValue: "pending"
    },
    expired_at: {
      type: DataTypes.DATE,
      allowNull: false
    }
  },
  {
    tableName: "payments",
    timestamps: false
  }
);

export default Payment;
