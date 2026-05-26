import { motion } from "framer-motion";
import { Star } from "lucide-react";

const data = [
  { name: "Rina", text: "Produknya enak dan gym-nya nyaman buat latihan sepulang kerja.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80" },
  { name: "Bima", text: "Membership bulanan terasa worth it. Staff membantu banget.", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80" },
  { name: "Dewi", text: "Minuman energinya pas, tidak terlalu manis, cocok sebelum workout.", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80" }
];

export default function TestimonialsSection() {
  return (
    <section className="py-20">
      <div className="section-shell">
        <p className="font-bold text-primary">Testimoni</p>
        <h2 className="mt-2 text-3xl font-black md:text-4xl">Dipakai pelanggan yang konsisten bergerak.</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {data.map((item) => (
            <motion.div key={item.name} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="card p-6">
              <div className="flex text-yellow-400">{Array.from({ length: 5 }).map((_, index) => <Star key={index} size={18} fill="currentColor" />)}</div>
              <p className="mt-4 leading-7 text-gray-700">"{item.text}"</p>
              <div className="mt-5 flex items-center gap-3">
                <img src={item.avatar} alt={item.name} className="h-11 w-11 rounded-full object-cover" />
                <span className="font-bold">{item.name}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
