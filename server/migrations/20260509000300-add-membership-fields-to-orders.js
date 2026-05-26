export async function up(queryInterface, Sequelize) {
  const table = await queryInterface.describeTable("orders");

  if (!table.order_type) {
    await queryInterface.addColumn("orders", "order_type", {
      type: Sequelize.ENUM("product", "membership"),
      allowNull: false,
      defaultValue: "product",
      after: "total_price"
    });
  }

  if (!table.membership_id) {
    await queryInterface.addColumn("orders", "membership_id", {
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
  }
}

export async function down(queryInterface) {
  const table = await queryInterface.describeTable("orders");

  if (table.membership_id) {
    await queryInterface.removeColumn("orders", "membership_id");
  }

  if (table.order_type) {
    await queryInterface.removeColumn("orders", "order_type");
  }
}
