import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    total_price: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    order_type: {
      type: DataTypes.ENUM("product", "membership"),
      allowNull: false,
      defaultValue: "product"
    },
    membership_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM("pending", "paid", "cancelled", "processing"),
      allowNull: false,
      defaultValue: "pending"
    },
    payment_method: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "qris"
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: "orders",
    timestamps: false
  }
);

export default Order;
