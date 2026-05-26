export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("memberships", {
    id: {
      type: Sequelize.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: Sequelize.STRING(120),
      allowNull: false
    },
    duration_days: {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false
    },
    price: {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false
    },
    benefits: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable("memberships");
}
