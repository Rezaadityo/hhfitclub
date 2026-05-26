import { productSeedData } from "./productSeeder.js";

export async function up(queryInterface) {
  await queryInterface.bulkInsert("products", productSeedData);
}

export async function down(queryInterface) {
  await queryInterface.bulkDelete("products", {
    name: productSeedData.map((product) => product.name)
  });
}
