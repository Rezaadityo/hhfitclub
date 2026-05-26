import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Transaction = sequelize.define(
  "Transaction",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    order_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    payment_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      unique: true
    },
    amount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    status: {
      type: DataTypes.ENUM("pending", "success", "expired", "failed"),
      allowNull: false,
      defaultValue: "pending"
    },
    paid_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    tableName: "transactions",
    timestamps: false
  }
);

export default Transaction;
