import { useEffect, useState } from "react";
import api from "../../services/api.js";
import { formatDate, formatRupiah } from "../../utils/format.js";

const STATUS_STYLES = {
  paid:       "bg-green-100 text-green-800",
  pending:    "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  cancelled:  "bg-red-100 text-red-800",
};

const ALL_STATUSES = ["pending", "paid", "processing", "cancelled"];

export default function AdminTransactions() {
  const [rows, setRows]       = useState([]);
  const [filters, setFilters] = useState({ search: "", status: "", startDate: "", endDate: "" });
  const [detail, setDetail]   = useState(null);
  const [updating, setUpdating] = useState(false);
  const [toast, setToast]     = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = () =>
    api.get("/admin/transactions", { params: filters })
       .then((res) => setRows(res.data.data.data))
       .catch(() => showToast("Gagal memuat transaksi.", "error"));

  useEffect(() => { load(); }, []);

  const openDetail = async (id) => {
    try {
      const res = await api.get(`/admin/transactions/${id}`);
      setDetail(res.data.data);
    } catch {
      showToast("Gagal memuat detail transaksi.", "error");
    }
  };

  // ── Update status order dari modal detail ──
  const handleStatusUpdate = async (newStatus) => {
    if (!detail) return;
    setUpdating(true);
    try {
      await api.put(`/admin/transactions/${detail.id}/status`, { status: newStatus });
      showToast(`Status order #${detail.id} diperbarui ke "${newStatus}".`);
      // Refresh detail & list
      const res = await api.get(`/admin/transactions/${detail.id}`);
      setDetail(res.data.data);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal memperbarui status.", "error");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <section>
      {/* Toast */}
      {toast && (
        <div className={`fixed right-5 top-5 z-[9999] rounded-lg px-5 py-3 text-sm font-semibold shadow-lg text-white
          ${toast.type === "error" ? "bg-red-500" : "bg-green-600"}`}>
          {toast.msg}
        </div>
      )}

      <h1 className="text-2xl font-black">Transaksi</h1>

      {/* Filter */}
      <div className="card mt-6 grid gap-3 p-4 md:grid-cols-5">
        <input
          className="input" placeholder="Cari customer"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <select
          className="input" value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">Semua Status</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <input className="input" type="date" value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
        <input className="input" type="date" value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
        <button className="btn-primary" onClick={load}>Filter</button>
      </div>

      {/* Tabel */}
      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Produk / Tipe</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
              <th className="p-3">Waktu</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-gray-400">Tidak ada transaksi.</td></tr>
            )}
            {rows.map((row) => (
              <tr
                key={row.id}
                className="cursor-pointer border-t hover:bg-gray-50"
                onClick={() => openDetail(row.id)}
              >
                <td className="p-3 font-bold">#{row.id}</td>
                <td className="p-3">
                  <p className="font-semibold">{row.user?.name}</p>
                  <p className="text-xs text-gray-400">{row.user?.email}</p>
                </td>
                <td className="p-3">
                  {row.order_type === "membership"
                    ? <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-700">Membership</span>
                    : row.items?.map((i) => i.product?.name).filter(Boolean).join(", ") || "—"
                  }
                </td>
                <td className="p-3 font-bold">{formatRupiah(row.total_price)}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_STYLES[row.status] || "bg-gray-100 text-gray-600"}`}>
                    {row.status}
                  </span>
                </td>
                <td className="p-3 text-gray-400">{formatDate(row.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Modal Detail ── */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-black">Detail Transaksi #{detail.id}</h2>
                <p className="mt-1 text-sm text-gray-500">{detail.user?.name} — {detail.user?.email}</p>
                {detail.user?.phone && <p className="text-xs text-gray-400">{detail.user.phone}</p>}
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLES[detail.status] || "bg-gray-100"}`}>
                {detail.status}
              </span>
            </div>

            {/* Item produk */}
            <div className="mt-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
                {detail.order_type === "membership" ? "Paket" : "Produk Dibeli"}
              </p>
              {detail.order_type === "membership" ? (
                <div className="rounded-lg bg-purple-50 p-3 text-sm font-semibold text-purple-800">
                  🏋️ Membership: {detail.membership?.name || "—"} ({detail.membership?.duration_days} hari)
                </div>
              ) : (
                <div className="space-y-2">
                  {detail.items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                      <div>
                        <p className="font-semibold">{item.product?.name}</p>
                        <p className="text-xs text-gray-400">{formatRupiah(item.price)} × {item.quantity}</p>
                      </div>
                      <b>{formatRupiah(item.price * item.quantity)}</b>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pembayaran info */}
            <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm">
              <p>Status Pembayaran: <b>{detail.payment?.status || "—"}</b></p>
              <p className="mt-1">Metode: <b className="uppercase">{detail.payment_method}</b></p>
              {detail.status === "paid" && (
                <p className="mt-1 text-yellow-700 font-semibold">
                  ⭐ Poin diberikan: +{Math.floor(Number(detail.total_price) / 10000)} poin
                </p>
              )}
            </div>

            {/* Total */}
            <div className="mt-4 flex justify-between border-t pt-4">
              <span className="font-bold text-gray-600">Total Pembayaran</span>
              <span className="text-lg font-black text-primary">{formatRupiah(detail.total_price)}</span>
            </div>

            {/* ── Update Status ── */}
            <div className="mt-5 border-t pt-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">Perbarui Status Order</p>
              <div className="flex flex-wrap gap-2">
                {ALL_STATUSES.filter((s) => s !== detail.status).map((s) => (
                  <button
                    key={s}
                    disabled={updating}
                    onClick={() => handleStatusUpdate(s)}
                    className={`rounded-lg border px-4 py-2 text-sm font-bold transition hover:opacity-80 disabled:opacity-50
                      ${STATUS_STYLES[s] || "bg-gray-100 text-gray-700"}`}
                  >
                    {updating ? "…" : `→ ${s.charAt(0).toUpperCase() + s.slice(1)}`}
                  </button>
                ))}
              </div>
            </div>

            <button className="btn-primary mt-6 w-full" onClick={() => setDetail(null)}>Tutup</button>
          </div>
        </div>
      )}
    </section>
  );
}
