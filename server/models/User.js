import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [8, 255]
      }
    },
    role: {
      type: DataTypes.ENUM("member", "admin"),
      allowNull: false,
      defaultValue: "member"
    },
    phone: {
      type: DataTypes.STRING(25),
      allowNull: true,
      validate: {
        len: [8, 25]
      }
    },
    points: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "Total loyalty points yang dimiliki member"
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: "users",
    timestamps: false,
    defaultScope: {
      attributes: {
        exclude: ["password"]
      }
    },
    scopes: {
      withPassword: {
        attributes: {}
      }
    }
  }
);

export default User;
