// ============================================================
// FILE: server/migrations/20260526000100-add-points-to-users.js
// CARA JALANKAN: npx sequelize-cli db:migrate
// ============================================================

export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn("users", "points", {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: "Total loyalty points yang dimiliki member"
  });
}

export async function down(queryInterface) {
  await queryInterface.removeColumn("users", "points");
}
