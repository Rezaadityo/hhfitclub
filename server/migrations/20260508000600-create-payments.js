export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("payments", {
    id: {
      type: Sequelize.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    order_id: {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      unique: true,
      references: {
        model: "orders",
        key: "id"
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE"
    },
    midtrans_token: {
      type: Sequelize.STRING(255),
      allowNull: true
    },
    redirect_url: {
      type: Sequelize.STRING(500),
      allowNull: true
    },
    qr_url: {
      type: Sequelize.STRING(500),
      allowNull: true
    },
    status: {
      type: Sequelize.ENUM("pending", "success", "expired", "failed"),
      allowNull: false,
      defaultValue: "pending"
    },
    expired_at: {
      type: Sequelize.DATE,
      allowNull: false
    }
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable("payments");
}
