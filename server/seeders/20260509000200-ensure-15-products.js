import { productSeedData } from "./productSeeder.js";

export async function up(queryInterface) {
  const [rows] = await queryInterface.sequelize.query("SELECT name FROM products");
  const existingNames = new Set(rows.map((row) => row.name));
  const missingProducts = productSeedData.filter((product) => !existingNames.has(product.name));

  if (missingProducts.length > 0) {
    await queryInterface.bulkInsert("products", missingProducts);
  }
}

export async function down(queryInterface) {
  await queryInterface.bulkDelete("products", {
    name: productSeedData.map((product) => product.name)
  });
}
