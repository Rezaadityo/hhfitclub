import { useEffect, useState } from "react";
import api from "../services/api.js";
import ProductCard from "../components/ProductCard.jsx";

const tabs = [
  { label: "Semua", value: "" },
  { label: "Minuman Sehat", value: "minuman_sehat" },
  { label: "Minuman Energi", value: "minuman_energi" },
  { label: "Suplemen", value: "suplemen" }
];

export default function Products() {
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    api
      .get("/products", { params: { category, search: debouncedSearch, limit: 50 } })
      .then((response) => setProducts(response.data.data.data))
      .finally(() => setLoading(false));
  }, [category, debouncedSearch]);

  return (
    <main className="section-shell py-12">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-bold text-primary">Katalog</p>
          <h1 className="text-3xl font-black md:text-4xl">Produk HH FIT CLUB</h1>
        </div>
        <input className="input md:max-w-sm" placeholder="Cari produk..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button key={tab.value} className={`rounded-md px-4 py-2 text-sm font-bold ${category === tab.value ? "bg-primary text-white" : "bg-white text-gray-700"}`} onClick={() => setCategory(tab.value)}>
            {tab.label}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-72 animate-pulse rounded-lg bg-gray-200" />)}</div>
      ) : products.length === 0 ? (
        <div className="mt-8 rounded-lg bg-white p-10 text-center text-gray-500">Produk tidak ditemukan.</div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      )}
    </main>
  );
}
