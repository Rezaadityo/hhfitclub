import { Minus, Plus, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useCartStore from "../context/useCartStore.js";
import { formatRupiah } from "../utils/format.js";

export default function CartSidebar() {
  const navigate = useNavigate();
  const { items, isOpen, closeCart, removeItem, updateQty, total } = useCartStore();

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-black/40" onClick={closeCart} />}
      <aside className={`fixed right-0 top-0 z-50 h-full w-full max-w-md transform bg-white shadow-xl transition ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex h-16 items-center justify-between border-b px-5">
          <h2 className="text-lg font-bold">Keranjang</h2>
          <button onClick={closeCart} className="rounded-md p-2 hover:bg-gray-100"><X size={20} /></button>
        </div>
        <div className="h-[calc(100%-160px)] overflow-y-auto p-5">
          {items.length === 0 ? (
            <p className="text-sm text-gray-500">Keranjang masih kosong.</p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div className="flex gap-3" key={item.id}>
                  <img src={item.image_url} alt={item.name} className="h-16 w-16 rounded-md object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-500">{formatRupiah(item.price)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button className="rounded border p-1" onClick={() => updateQty(item.id, item.quantity - 1)}><Minus size={14} /></button>
                      <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                      <button className="rounded border p-1" onClick={() => updateQty(item.id, item.quantity + 1)}><Plus size={14} /></button>
                    </div>
                  </div>
                  <button className="self-start rounded-md p-2 text-red-600 hover:bg-red-50" onClick={() => removeItem(item.id)}><Trash2 size={17} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="border-t p-5">
          <div className="mb-4 flex justify-between font-bold">
            <span>Subtotal</span>
            <span>{formatRupiah(total())}</span>
          </div>
          <button className="btn-primary w-full" disabled={items.length === 0} onClick={() => { closeCart(); navigate("/checkout"); }}>Checkout</button>
        </div>
      </aside>
    </>
  );
}
