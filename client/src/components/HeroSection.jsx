import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function HeroSection() {
  const { isAuthenticated, user } = useAuth();

  return (
    <section className="relative min-h-[620px] overflow-hidden bg-gray-950">
      <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1800&q=80" alt="Fitness gym" className="absolute inset-0 h-full w-full object-cover opacity-45" />
      <div className="absolute inset-0 bg-black/55" />
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="section-shell relative flex min-h-[620px] items-center">
        <div className="max-w-2xl pt-10 text-white">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-300">HH FIT CLUB</p>
          <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">Sehat dari Dalam, Kuat dari Luar</h1>
          <p className="mt-5 text-lg leading-8 text-gray-100">Temukan minuman sehat, energi latihan, suplemen, dan paket membership gym yang mendukung rutinitas fit kamu setiap hari.</p>
          {isAuthenticated && (
            <div className="mt-6 rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur">
              <p className="text-sm font-semibold text-green-200">Selamat datang kembali,</p>
              <p className="text-2xl font-black text-white">{user?.name}</p>
            </div>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="btn-primary" to="/products">Lihat Produk</Link>
            <Link className="btn-outline border-white/60 bg-white/10 text-white hover:border-white hover:text-white" to="/memberships">Daftar Membership</Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
