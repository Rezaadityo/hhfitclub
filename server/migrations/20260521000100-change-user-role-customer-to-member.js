export async function up(queryInterface) {
  await queryInterface.sequelize.query("ALTER TABLE users MODIFY role ENUM('customer', 'member', 'admin') NOT NULL DEFAULT 'member'");
  await queryInterface.sequelize.query("UPDATE users SET role = 'member' WHERE role = 'customer'");
  await queryInterface.sequelize.query("ALTER TABLE users MODIFY role ENUM('member', 'admin') NOT NULL DEFAULT 'member'");
}

export async function down(queryInterface) {
  await queryInterface.sequelize.query("ALTER TABLE users MODIFY role ENUM('customer', 'member', 'admin') NOT NULL DEFAULT 'customer'");
  await queryInterface.sequelize.query("UPDATE users SET role = 'customer' WHERE role = 'member'");
  await queryInterface.sequelize.query("ALTER TABLE users MODIFY role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer'");
}
