import User from "./User.js";
import Product from "./Product.js";
import Membership from "./Membership.js";
import Order from "./Order.js";
import OrderItem from "./OrderItem.js";
import Payment from "./Payment.js";
import Transaction from "./Transaction.js";

User.hasMany(Order, {
  foreignKey: "user_id",
  as: "orders"
});
Order.belongsTo(User, {
  foreignKey: "user_id",
  as: "user"
});

Order.hasMany(OrderItem, {
  foreignKey: "order_id",
  as: "items"
});
OrderItem.belongsTo(Order, {
  foreignKey: "order_id",
  as: "order"
});

Product.hasMany(OrderItem, {
  foreignKey: "product_id",
  as: "orderItems"
});
OrderItem.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product"
});

Membership.hasMany(Order, {
  foreignKey: "membership_id",
  as: "orders"
});
Order.belongsTo(Membership, {
  foreignKey: "membership_id",
  as: "membership"
});

Order.hasOne(Payment, {
  foreignKey: "order_id",
  as: "payment"
});
Payment.belongsTo(Order, {
  foreignKey: "order_id",
  as: "order"
});

Payment.hasOne(Transaction, {
  foreignKey: "payment_id",
  as: "transaction"
});
Transaction.belongsTo(Payment, {
  foreignKey: "payment_id",
  as: "payment"
});

Order.hasOne(Transaction, {
  foreignKey: "order_id",
  as: "transaction"
});
Transaction.belongsTo(Order, {
  foreignKey: "order_id",
  as: "order"
});

export {
  User,
  Product,
  Membership,
  Order,
  OrderItem,
  Payment,
  Transaction
};
