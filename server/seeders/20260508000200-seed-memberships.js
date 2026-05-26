export async function up(queryInterface) {
  await queryInterface.bulkInsert("memberships", [
    {
      name: "Daily Pass",
      duration_days: 1,
      price: 25000,
      benefits: "Akses gym satu hari, locker harian, dan konsultasi singkat penggunaan alat.",
      is_active: true
    },
    {
      name: "Monthly Fit",
      duration_days: 30,
      price: 250000,
      benefits: "Akses gym 30 hari, jadwal latihan dasar, locker, dan diskon 5% produk minuman.",
      is_active: true
    },
    {
      name: "Quarterly Pro",
      duration_days: 90,
      price: 650000,
      benefits: "Akses gym 90 hari, konsultasi nutrisi bulanan, program latihan personal, dan diskon 10% produk.",
      is_active: true
    }
  ]);
}

export async function down(queryInterface) {
  await queryInterface.bulkDelete("memberships", {
    name: ["Daily Pass", "Monthly Fit", "Quarterly Pro"]
  });
}
