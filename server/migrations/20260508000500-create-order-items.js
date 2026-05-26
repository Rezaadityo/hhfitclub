export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("order_items", {
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
    product_id: {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "products",
        key: "id"
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT"
    },
    quantity: {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false
    },
    price: {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false
    }
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable("order_items");
}
