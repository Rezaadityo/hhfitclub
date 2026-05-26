import { motion } from "framer-motion";
import { BadgeCheck, Dumbbell, Wallet } from "lucide-react";

const items = [
  { icon: BadgeCheck, title: "Produk Berkualitas", text: "Pilihan minuman dan suplemen yang cocok untuk gaya hidup aktif." },
  { icon: Dumbbell, title: "Gym Modern", text: "Fasilitas latihan nyaman untuk pemula sampai pengguna rutin." },
  { icon: Wallet, title: "Harga Terjangkau", text: "Paket fleksibel untuk kebutuhan harian, bulanan, hingga jangka panjang." }
];

export default function AboutSection() {
  return (
    <section id="about" className="bg-white py-20">
      <div className="section-shell">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl">
          <p className="font-bold text-primary">Tentang Kami</p>
          <h2 className="mt-2 text-3xl font-black md:text-4xl">Tempat sederhana untuk mulai hidup lebih kuat.</h2>
          <p className="mt-4 leading-7 text-gray-600">HH FIT CLUB menggabungkan layanan fitness center, paket membership, dan produk minuman kesehatan untuk membantu pelanggan membangun kebiasaan sehat yang realistis.</p>
        </motion.div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {items.map((item) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="card p-6">
              <item.icon className="text-primary" size={32} />
              <h3 className="mt-4 text-lg font-bold">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
