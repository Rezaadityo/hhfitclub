import { useEffect, useState } from "react";
import api from "../../services/api.js";
import { formatRupiah } from "../../utils/format.js";

const empty = { name: "", duration_days: "", price: "", benefits: "" };

export default function AdminMemberships() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const load = () => api.get("/admin/memberships").then((res) => setRows(res.data.data));
  useEffect(() => { load(); }, []);
  const save = async (event) => {
    event.preventDefault();
    if (editing) await api.put(`/admin/memberships/${editing}`, form);
    else await api.post("/admin/memberships", form);
    setForm(empty); setEditing(null); load();
  };
  return (
    <section>
      <h1 className="text-2xl font-black">Membership</h1>
      <form onSubmit={save} className="card mt-6 grid gap-3 p-5 md:grid-cols-4">
        <input className="input" placeholder="Nama" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="input" placeholder="Durasi hari" value={form.duration_days} onChange={(e) => setForm({ ...form, duration_days: e.target.value })} />
        <input className="input" placeholder="Harga" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <button className="btn-primary">{editing ? "Update" : "Tambah"}</button>
        <textarea className="input md:col-span-4" placeholder="Benefits" value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} />
      </form>
      <div className="card mt-6 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-50"><tr><th className="p-3">Nama</th><th>Durasi</th><th>Harga</th><th>Status</th><th>Aksi</th></tr></thead><tbody>{rows.map((m) => <tr className="border-t" key={m.id}><td className="p-3">{m.name}</td><td>{m.duration_days} hari</td><td>{formatRupiah(m.price)}</td><td>{m.is_active ? "Aktif" : "Nonaktif"}</td><td><button className="font-bold text-primary" onClick={() => { setEditing(m.id); setForm(m); }}>Edit</button><button className="ml-3 font-bold text-red-600" onClick={async () => { if (confirm("Hapus membership?")) { await api.delete(`/admin/memberships/${m.id}`); load(); } }}>Hapus</button></td></tr>)}</tbody></table></div>
    </section>
  );
}
