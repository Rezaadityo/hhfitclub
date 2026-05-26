import { useEffect, useState } from "react";
import api from "../../services/api.js";
import { formatDate, formatRupiah } from "../../utils/format.js";

export default function AdminCustomers() {
  const [rows, setRows]         = useState([]);
  const [search, setSearch]     = useState("");
  const [pointsModal, setPointsModal] = useState(null); // { member }
  const [pointInput, setPointInput]   = useState("");
  const [pointMode, setPointMode]     = useState("add");
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = () =>
    api.get("/admin/members", { params: { search } })
       .then((res) => setRows(res.data.data))
       .catch(() => showToast("Gagal memuat data member.", "error"));

  useEffect(() => { load(); }, []);

  const openPointsModal = (member) => {
    setPointsModal({ member });
    setPointInput("");
    setPointMode("add");
  };

  const savePoints = async () => {
    const val = parseInt(pointInput, 10);
    if (!Number.isInteger(val) || val < 0) {
      showToast("Masukkan angka poin yang valid.", "error");
      return;
    }
    setSaving(true);
    try {
      await api.put(`/admin/members/${pointsModal.member.id}/points`, { points: val, mode: pointMode });
      showToast(`Poin member ${pointsModal.member.name} berhasil diperbarui.`);
      setPointsModal(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal memperbarui poin.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      {/* Toast */}
      {toast && (
        <div className={`fixed right-5 top-5 z-[9999] rounded-lg px-5 py-3 text-sm font-semibold text-white shadow-lg
          ${toast.type === "error" ? "bg-red-500" : "bg-green-600"}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-2xl font-black">Member</h1>
        <div className="flex gap-2">
          <input
            className="input" placeholder="Cari nama/email"
            value={search} onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
          />
          <button className="btn-primary" onClick={load}>Cari</button>
        </div>
      </div>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="p-3">Nama</th>
              <th className="p-3">Email</th>
              <th className="p-3">Telepon</th>
              <th className="p-3">Total Order</th>
              <th className="p-3">Total Spent</th>
              <th className="p-3">⭐ Poin</th>
              <th className="p-3">Daftar</th>
              <th className="p-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={8} className="p-8 text-center text-gray-400">Tidak ada member.</td></tr>
            )}
            {rows.map((row) => (
              <tr key={row.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-semibold">{row.name}</td>
                <td className="p-3 text-gray-500">{row.email}</td>
                <td className="p-3 text-gray-500">{row.phone || "—"}</td>
                <td className="p-3 text-center font-bold">{row.totalOrders}</td>
                <td className="p-3 font-bold text-primary">{formatRupiah(row.totalSpent)}</td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-0.5 text-xs font-bold text-yellow-700">
                    ⭐ {(row.points ?? 0).toLocaleString("id-ID")}
                  </span>
                </td>
                <td className="p-3 text-gray-400 text-xs">{formatDate(row.created_at)}</td>
                <td className="p-3">
                  <button
                    onClick={() => openPointsModal(row)}
                    className="rounded-lg bg-yellow-50 px-3 py-1.5 text-xs font-bold text-yellow-700 hover:bg-yellow-100 transition"
                  >
                    Edit Poin
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Modal Edit Poin ── */}
      {pointsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-black">Edit Poin — {pointsModal.member.name}</h2>
            <p className="mt-1 text-sm text-gray-500">Poin saat ini:
              <strong className="text-yellow-600 ml-1">
                ⭐ {(pointsModal.member.points ?? 0).toLocaleString("id-ID")}
              </strong>
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Mode</label>
                <div className="mt-1 flex gap-2">
                  {[
                    { v: "add",      label: "+ Tambah" },
                    { v: "subtract", label: "− Kurangi" },
                    { v: "set",      label: "= Set Langsung" },
                  ].map(({ v, label }) => (
                    <button
                      key={v}
                      onClick={() => setPointMode(v)}
                      className={`flex-1 rounded-lg py-2 text-xs font-bold border transition
                        ${pointMode === v
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-gray-600 border-gray-200 hover:border-primary"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Jumlah Poin</label>
                <input
                  type="number" min="0"
                  className="input mt-1 w-full"
                  placeholder="Contoh: 50"
                  value={pointInput}
                  onChange={(e) => setPointInput(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                className="flex-1 rounded-lg border py-2 text-sm font-bold text-gray-500 hover:bg-gray-50"
                onClick={() => setPointsModal(null)}
              >
                Batal
              </button>
              <button
                disabled={saving}
                className="btn-primary flex-1"
                onClick={savePoints}
              >
                {saving ? "Menyimpan…" : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
