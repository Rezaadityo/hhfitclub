export const productSeedData = [
  {
    name: "Green Power Detox",
    category: "minuman_sehat",
    description: "Cold pressed juice berbasis sayuran hijau, apel, dan lemon untuk dukungan nutrisi harian.",
    price: 25000,
    stock: 40,
    image_url: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=800&q=80",
    is_active: true
  },
  {
    name: "Berry Whey Smoothie",
    category: "minuman_sehat",
    description: "Smoothie berry dengan whey protein untuk pemulihan setelah latihan.",
    price: 35000,
    stock: 35,
    image_url: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=800&q=80",
    is_active: true
  },
  {
    name: "Isotonic Lime Drink",
    category: "minuman_sehat",
    description: "Minuman isotonik rasa lime untuk membantu hidrasi setelah olahraga.",
    price: 18000,
    stock: 60,
    image_url: "https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=800&q=80",
    is_active: true
  },
  {
    name: "Cold Pressed Carrot Orange",
    category: "minuman_sehat",
    description: "Jus wortel dan jeruk segar untuk asupan vitamin harian.",
    price: 28000,
    stock: 32,
    image_url: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=800&q=80",
    is_active: true
  },
  {
    name: "Oat Banana Protein Shake",
    category: "minuman_sehat",
    description: "Shake oat, pisang, dan protein untuk energi yang lebih stabil.",
    price: 30000,
    stock: 38,
    image_url: "https://images.unsplash.com/photo-1570696516188-ade861b84a49?auto=format&fit=crop&w=800&q=80",
    is_active: true
  },
  {
    name: "Pre-workout Coffee",
    category: "minuman_energi",
    description: "Kopi pre-workout untuk dorongan fokus sebelum sesi latihan.",
    price: 24000,
    stock: 45,
    image_url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
    is_active: true
  },
  {
    name: "Guarana Boost",
    category: "minuman_energi",
    description: "Minuman energi guarana dengan rasa buah yang segar.",
    price: 26000,
    stock: 42,
    image_url: "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&w=800&q=80",
    is_active: true
  },
  {
    name: "HH Energy Boost",
    category: "minuman_energi",
    description: "Minuman energi ringan untuk membantu performa latihan tetap stabil.",
    price: 22000,
    stock: 50,
    image_url: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80",
    is_active: true
  },
  {
    name: "Electrolyte Citrus",
    category: "minuman_energi",
    description: "Minuman elektrolit rasa citrus untuk rehidrasi cepat.",
    price: 18000,
    stock: 60,
    image_url: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=800&q=80",
    is_active: true
  },
  {
    name: "Matcha Energy Latte",
    category: "minuman_energi",
    description: "Matcha latte dengan energi ringan untuk aktivitas produktif.",
    price: 27000,
    stock: 30,
    image_url: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=800&q=80",
    is_active: true
  },
  {
    name: "Whey Fit Vanilla",
    category: "suplemen",
    description: "Suplemen whey protein rasa vanilla untuk kebutuhan protein harian.",
    price: 185000,
    stock: 20,
    image_url: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=800&q=80",
    is_active: true
  },
  {
    name: "Creatine Monohydrate",
    category: "suplemen",
    description: "Creatine monohydrate untuk mendukung kekuatan dan performa latihan.",
    price: 155000,
    stock: 25,
    image_url: "https://images.unsplash.com/photo-1579722820308-d74e571900a9?auto=format&fit=crop&w=800&q=80",
    is_active: true
  },
  {
    name: "BCAA Tropical",
    category: "suplemen",
    description: "BCAA rasa tropical untuk dukungan pemulihan otot.",
    price: 145000,
    stock: 28,
    image_url: "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?auto=format&fit=crop&w=800&q=80",
    is_active: true
  },
  {
    name: "Daily Multivitamin",
    category: "suplemen",
    description: "Multivitamin harian untuk menjaga kebutuhan mikronutrien.",
    price: 90000,
    stock: 36,
    image_url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
    is_active: true
  },
  {
    name: "Mass Gainer Chocolate",
    category: "suplemen",
    description: "Mass gainer rasa cokelat untuk kebutuhan kalori dan protein tambahan.",
    price: 220000,
    stock: 18,
    image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80",
    is_active: true
  }
];

export async function up(queryInterface) {
  await queryInterface.bulkInsert("products", productSeedData);
}

export async function down(queryInterface) {
  await queryInterface.bulkDelete("products", {
    name: productSeedData.map((product) => product.name)
  });
}
