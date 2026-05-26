import { Sequelize } from "sequelize";
import sequelize from "./db.js";

const addColumnIfMissing = async (queryInterface, tableName, columnName, definition) => {
  const table = await queryInterface.describeTable(tableName);

  if (!table[columnName]) {
    await queryInterface.addColumn(tableName, columnName, definition);
    console.log(`Added missing column ${tableName}.${columnName}`);
  }
};

export const ensureSchema = async () => {
  const queryInterface = sequelize.getQueryInterface();

  await sequelize.query("ALTER TABLE users MODIFY role ENUM('customer', 'member', 'admin') NOT NULL DEFAULT 'member'");
  await sequelize.query("UPDATE users SET role = 'member' WHERE role = 'customer'");
  await sequelize.query("ALTER TABLE users MODIFY role ENUM('member', 'admin') NOT NULL DEFAULT 'member'");

  await addColumnIfMissing(queryInterface, "payments", "redirect_url", {
    type: Sequelize.STRING(500),
    allowNull: true,
    after: "midtrans_token"
  });

  await addColumnIfMissing(queryInterface, "orders", "order_type", {
    type: Sequelize.ENUM("product", "membership"),
    allowNull: false,
    defaultValue: "product",
    after: "total_price"
  });

  await addColumnIfMissing(queryInterface, "orders", "membership_id", {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: true,
    references: {
      model: "memberships",
      key: "id"
    },
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
    after: "order_type"
  });
};
