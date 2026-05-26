export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("products", {
    id: {
      type: Sequelize.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: Sequelize.STRING(150),
      allowNull: false
    },
    category: {
      type: Sequelize.ENUM("minuman_sehat", "minuman_energi", "suplemen"),
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    price: {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false
    },
    stock: {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },
    image_url: {
      type: Sequelize.STRING(500),
      allowNull: true
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable("products");
}
