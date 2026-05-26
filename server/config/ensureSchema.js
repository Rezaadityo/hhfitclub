import { Sequelize } from "sequelize";
import sequelize from "./db.js";

const addColumnIfMissing = async (queryInterface, tableName, columnName, definition) => {
  try {
    const table = await queryInterface.describeTable(tableName);
    if (!table[columnName]) {
      await queryInterface.addColumn(tableName, columnName, definition);
      console.log(`Added missing column ${tableName}.${columnName}`);
    }
  } catch (err) {
    // Tabel belum ada — skip, migrate.js yang akan membuatnya
    if (err.original?.errno === 1146 || err.message?.includes("doesn't exist")) {
      console.log(`Skipping ensureSchema for ${tableName} — table not yet created.`);
      return;
    }
    throw err;
  }
};

export const ensureSchema = async () => {
  const queryInterface = sequelize.getQueryInterface();

  // Cek apakah tabel users sudah ada sebelum menjalankan ALTER
  try {
    await sequelize.query("SELECT 1 FROM users LIMIT 1");
  } catch {
    // Tabel users belum ada, skip semua ALTER — migrate.js akan membuat semua tabel
    console.log("Tables not yet created — skipping ensureSchema, run db:migrate first.");
    return;
  }

  try {
    await sequelize.query("ALTER TABLE users MODIFY role ENUM('customer', 'member', 'admin') NOT NULL DEFAULT 'member'");
    await sequelize.query("UPDATE users SET role = 'member' WHERE role = 'customer'");
    await sequelize.query("ALTER TABLE users MODIFY role ENUM('member', 'admin') NOT NULL DEFAULT 'member'");
  } catch {
    // Kolom role mungkin sudah benar, abaikan error ALTER
  }

  await addColumnIfMissing(queryInterface, "payments", "redirect_url", {
    type:      Sequelize.STRING(500),
    allowNull: true,
    after:     "midtrans_token"
  });

  await addColumnIfMissing(queryInterface, "payments", "qr_url", {
    type:      Sequelize.STRING(500),
    allowNull: true,
    after:     "redirect_url"
  });

  await addColumnIfMissing(queryInterface, "orders", "order_type", {
    type:         Sequelize.ENUM("product", "membership"),
    allowNull:    false,
    defaultValue: "product",
    after:        "total_price"
  });

  await addColumnIfMissing(queryInterface, "orders", "membership_id", {
    type:       Sequelize.INTEGER.UNSIGNED,
    allowNull:  true,
    references: { model: "memberships", key: "id" },
    onUpdate:   "CASCADE",
    onDelete:   "SET NULL",
    after:      "order_type"
  });

  await addColumnIfMissing(queryInterface, "users", "points", {
    type:         Sequelize.INTEGER.UNSIGNED,
    allowNull:    false,
    defaultValue: 0,
    after:        "phone"
  });
};
