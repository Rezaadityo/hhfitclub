import { Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useCartStore from "../context/useCartStore.js";
import api from "../services/api.js";
import { formatRupiah } from "../utils/format.js";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    api.get(`/products/${id}`).then((response) => setProduct(response.data.data));
  }, [id]);

  if (!product) {
    return <main className="section-shell py-12">Memuat produk...</main>;
  }

  return (
    <main className="section-shell grid gap-8 py-12 md:grid-cols-2">
      <img src={product.image_url} alt={product.name} className="h-[420px] w-full rounded-lg object-cover" />
      <section>
        <span className="rounded bg-green-50 px-2 py-1 text-sm font-bold text-primary">{product.category}</span>
        <h1 className="mt-4 text-4xl font-black">{product.name}</h1>
        <p className="mt-3 text-2xl font-black text-primary">{formatRupiah(product.price)}</p>
        <p className="mt-5 leading-7 text-gray-600">{product.description}</p>
        <p className="mt-4 font-semibold">Stok tersedia: {product.stock}</p>
        <div className="mt-6 flex items-center gap-3">
          <button className="rounded border p-2" onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={16} /></button>
          <span className="w-10 text-center font-bold">{qty}</span>
          <button className="rounded border p-2" onClick={() => setQty(Math.min(product.stock, qty + 1))}><Plus size={16} /></button>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <button className="btn-outline" onClick={() => addItem(product, qty)}>Tambah ke Keranjang</button>
          <button className="btn-primary" onClick={() => { addItem(product, qty); navigate("/checkout"); }}>Beli Sekarang</button>
        </div>
      </section>
    </main>
  );
}
