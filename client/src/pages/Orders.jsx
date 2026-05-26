import { useEffect, useState } from "react";
import { Package, ShoppingBag, Star, ChevronDown, ChevronUp, Clock, CheckCircle, XCircle, Loader } from "lucide-react";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { formatDate, formatRupiah } from "../utils/format.js";

// ── Status config ──
const STATUS_CONFIG = {
  paid:       { label: "Lunas",      bg: "bg-green-50",  text: "text-green-700",  icon: CheckCircle },
  pending:    { label: "Menunggu",   bg: "bg-yellow-50", text: "text-yellow-700", icon: Clock },
  processing: { label: "Diproses",  bg: "bg-blue-50",   text: "text-blue-700",   icon: Loader },
  cancelled:  { label: "Dibatalkan",bg: "bg-red-50",    text: "text-red-700",    icon: XCircle },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${cfg.bg} ${cfg.text}`}>
      <Icon size={12} />
      {cfg.label}
    </span>
  );
}

// ── Satu kartu order ──
function OrderCard({ order }) {
  const [open, setOpen] = useState(false);
  const isMembership = order.order_type === "membership";

  // Hitung estimasi poin: Rp10.000 = 1 poin (sama dengan logika backend)
  const pointsEarned = order.status === "paid"
    ? Math.floor(Number(order.total_price) / 10000)
    : 0;

  return (
    <article className="card overflow-hidden">
      {/* ── Header ── */}
      <div
        className="flex cursor-pointer flex-col gap-3 p-5 md:flex-row md:items-center"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-3 flex-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-primary">
            {isMembership ? <Star size={20} /> : <ShoppingBag size={20} />}
          </div>
          <div>
            <p className="font-black text-gray-900">
              {isMembership ? "Membership" : "Produk"} — Order #{order.id}
            </p>
            <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {/* Poin yang didapat */}
          {pointsEarned > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-3 py-1 text-xs font-bold text-yellow-700">
              ⭐ +{pointsEarned} Poin
            </span>
          )}
          <StatusBadge status={order.status} />
          <p className="font-black text-gray-900 whitespace-nowrap">{formatRupiah(order.total_price)}</p>
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </div>

      {/* ── Detail (expand) ── */}
      {open && (
        <div className="border-t bg-gray-50 p-5">
          {isMembership && order.membership ? (
            <div className="flex items-center gap-3">
              <Star size={16} className="text-primary" />
              <div>
                <p className="font-bold text-gray-800">{order.membership.name}</p>
                <p className="text-xs text-gray-500">Durasi: {order.membership.duration_days} hari</p>
              </div>
              <span className="ml-auto font-black text-gray-900">{formatRupiah(order.total_price)}</span>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Detail Produk</p>
              {order.items && order.items.length > 0 ? (
                order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    {item.product?.image_url ? (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-200 text-gray-400">
                        <Package size={20} />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm">{item.product?.name || "Produk"}</p>
                      <p className="text-xs text-gray-500">
                        {formatRupiah(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-bold text-gray-900 whitespace-nowrap">
                      {formatRupiah(item.price * item.quantity)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400">Detail produk tidak tersedia.</p>
              )}
            </div>
          )}

          {/* ── Ringkasan bawah ── */}
          <div className="mt-4 border-t pt-4 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-gray-500 space-y-0.5">
              <p>Metode: <span className="font-semibold uppercase">{order.payment_method}</span></p>
              <p>Pembayaran: <span className="font-semibold">{order.payment?.status || "—"}</span></p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Total Pembayaran</p>
              <p className="text-lg font-black text-primary">{formatRupiah(order.total_price)}</p>
              {pointsEarned > 0 && (
                <p className="text-xs text-yellow-600 font-semibold">+{pointsEarned} poin diperoleh</p>
              )}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

// ── Halaman utama ──
export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    api
      .get("/orders")
      .then((res) => setOrders(res.data.data))
      .catch(() => setError("Gagal memuat riwayat pesanan."))
      .finally(() => setLoading(false));
  }, []);

  const totalPoints = user?.points ?? 0;
  const paidOrders  = orders.filter((o) => o.status === "paid");

  return (
    <main className="section-shell py-12">
      <h1 className="text-3xl font-black">Riwayat Pesanan</h1>

      {/* ── Ringkasan poin ── */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="card p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 text-2xl">⭐</div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Total Poin</p>
            <p className="text-2xl font-black text-yellow-600">{totalPoints.toLocaleString("id-ID")}</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-2xl">✅</div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Order Selesai</p>
            <p className="text-2xl font-black text-green-700">{paidOrders.length}</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-2xl">🛍️</div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Total Order</p>
            <p className="text-2xl font-black text-gray-800">{orders.length}</p>
          </div>
        </div>
      </div>

      {/* ── Info cara dapat poin ── */}
      <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 px-5 py-3 text-sm text-yellow-800">
        💡 Setiap pembayaran Rp 10.000 = <strong>1 Poin</strong>. Poin otomatis masuk ke akun Anda setelah pembayaran dikonfirmasi.
      </div>

      {/* ── Daftar order ── */}
      <div className="mt-6 space-y-4">
        {loading && (
          <div className="card p-10 text-center text-gray-400">
            <Loader size={32} className="mx-auto animate-spin" />
            <p className="mt-2">Memuat riwayat pesanan…</p>
          </div>
        )}
        {error && (
          <div className="card p-10 text-center text-red-500">{error}</div>
        )}
        {!loading && !error && orders.length === 0 && (
          <div className="card p-14 text-center">
            <ShoppingBag size={48} className="mx-auto text-gray-200" />
            <p className="mt-4 font-semibold text-gray-400">Belum ada pesanan.</p>
            <a href="/products" className="btn-primary mt-4 inline-block">Mulai Belanja</a>
          </div>
        )}
        {!loading && orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </main>
  );
}
