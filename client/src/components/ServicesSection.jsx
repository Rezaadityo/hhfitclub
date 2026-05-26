import { motion } from "framer-motion";
import { CalendarDays, Dumbbell, Salad } from "lucide-react";

const services = [
  { icon: Dumbbell, title: "Gym Harian", text: "Latihan fleksibel tanpa komitmen panjang." },
  { icon: CalendarDays, title: "Membership Bulanan", text: "Akses rutin dengan benefit lebih hemat." },
  { icon: Salad, title: "Konsultasi Nutrisi", text: "Arahan dasar untuk pilihan asupan yang lebih sehat." }
];

export default function ServicesSection() {
  return (
    <section id="membership" className="bg-white py-20">
      <div className="section-shell">
        <p className="font-bold text-primary">Layanan</p>
        <h2 className="mt-2 text-3xl font-black md:text-4xl">Pilih cara fit yang cocok untukmu.</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {services.map((item) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="card p-6">
              <item.icon className="text-primary" size={34} />
              <h3 className="mt-4 text-xl font-bold">{item.title}</h3>
              <p className="mt-2 text-gray-600">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
