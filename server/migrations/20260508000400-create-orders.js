export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("orders", {
    id: {
      type: Sequelize.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    user_id: {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "users",
        key: "id"
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT"
    },
    total_price: {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false
    },
    order_type: {
      type: Sequelize.ENUM("product", "membership"),
      allowNull: false,
      defaultValue: "product"
    },
    membership_id: {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: "memberships",
        key: "id"
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    },
    status: {
      type: Sequelize.ENUM("pending", "paid", "cancelled", "processing"),
      allowNull: false,
      defaultValue: "pending"
    },
    payment_method: {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: "qris"
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
    }
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable("orders");
}
