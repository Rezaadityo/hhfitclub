export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("transactions", {
    id: {
      type: Sequelize.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    order_id: {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "orders",
        key: "id"
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE"
    },
    payment_id: {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      unique: true,
      references: {
        model: "payments",
        key: "id"
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE"
    },
    amount: {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false
    },
    status: {
      type: Sequelize.ENUM("pending", "success", "expired", "failed"),
      allowNull: false,
      defaultValue: "pending"
    },
    paid_at: {
      type: Sequelize.DATE,
      allowNull: true
    }
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable("transactions");
}
