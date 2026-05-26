export async function up(queryInterface, Sequelize) {
  const table = await queryInterface.describeTable("payments");

  if (!table.redirect_url) {
    await queryInterface.addColumn("payments", "redirect_url", {
      type: Sequelize.STRING(500),
      allowNull: true,
      after: "midtrans_token"
    });
  }
}

export async function down(queryInterface) {
  const table = await queryInterface.describeTable("payments");

  if (table.redirect_url) {
    await queryInterface.removeColumn("payments", "redirect_url");
  }
}
