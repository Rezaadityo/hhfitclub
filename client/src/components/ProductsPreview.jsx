import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard.jsx";

const products = [
  { id: 1, name: "Green Power Detox", category: "minuman_sehat", price: 25000, stock: 40, image_url: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=800&q=80" },
  { id: 2, name: "Berry Protein Smoothie", category: "minuman_sehat", price: 32000, stock: 35, image_url: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=800&q=80" },
  { id: 3, name: "HH Energy Boost", category: "minuman_energi", price: 22000, stock: 50, image_url: "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&w=800&q=80" },
  { id: 4, name: "Whey Fit Vanilla", category: "suplemen", price: 185000, stock: 20, image_url: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=800&q=80" }
];

export default function ProductsPreview() {
  return (
    <section className="py-20">
      <div className="section-shell">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-bold text-primary">Produk Unggulan</p>
            <h2 className="mt-2 text-3xl font-black md:text-4xl">Fuel untuk latihan hari ini.</h2>
          </div>
          <Link className="btn-outline" to="/products">Lihat Semua Produk</Link>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </motion.div>
      </div>
    </section>
  );
}
