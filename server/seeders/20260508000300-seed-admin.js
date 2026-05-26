import bcrypt from "bcrypt";

export async function up(queryInterface) {
  const password = await bcrypt.hash("Admin12345", 12);

  await queryInterface.bulkInsert("users", [
    {
      name: "Admin HH FIT CLUB",
      email: "admin@hhfitclub.com",
      password,
      role: "admin",
      phone: "081234567890",
      created_at: new Date()
    }
  ]);
}

export async function down(queryInterface) {
  await queryInterface.bulkDelete("users", {
    email: "admin@hhfitclub.com"
  });
}
