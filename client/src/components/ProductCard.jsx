import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import useCartStore from "../context/useCartStore.js";
import { formatRupiah } from "../utils/format.js";

export default function ProductCard({ product }) {
  const { addItem } = useCartStore();

  return (
    <article className="card overflow-hidden">
      <Link to={`/products/${product.id}`}>
        <img src={product.image_url || "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80"} alt={product.name} className="h-48 w-full object-cover" />
      </Link>
      <div className="p-4">
        <span className="rounded bg-green-50 px-2 py-1 text-xs font-bold text-primary">{product.category?.replace("_", " ")}</span>
        <Link to={`/products/${product.id}`} className="mt-2 block text-lg font-bold hover:text-primary">{product.name}</Link>
        <p className="mt-1 text-sm text-gray-500">Stok {product.stock}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-black">{formatRupiah(product.price)}</span>
          <button className="rounded-md bg-gray-950 p-2 text-white hover:bg-primary" onClick={() => addItem(product)}>
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}
