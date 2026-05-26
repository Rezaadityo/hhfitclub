import { useEffect, useState } from "react";
import api from "../../services/api.js";
import { formatRupiah } from "../../utils/format.js";

const empty = { name: "", category: "minuman_sehat", price: "", stock: "", description: "" };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = () => api.get("/admin/products").then((res) => setProducts(res.data.data.data));
  useEffect(() => { load(); }, []);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    const payload = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        payload.append(key, value);
      }
    });

    if (imageFile) {
      payload.append("image", imageFile);
    }

    try {
      if (editing) {
        await api.put(`/admin/products/${editing}`, payload);
        setMessage("Produk berhasil diperbarui.");
      } else {
        await api.post("/admin/products", payload);
        setMessage("Produk berhasil ditambahkan.");
      }

      setForm(empty);
      setEditing(null);
      setImageFile(null);
      setCurrentImage("");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan produk.");
    } finally {
      setSaving(false);
    }
  };

  const editProduct = (product) => {
    setEditing(product.id);
    setImageFile(null);
    setForm({
      name: product.name || "",
      category: product.category || "minuman_sehat",
      price: product.price || "",
      stock: product.stock || "",
      description: product.description || "",
    });
    setCurrentImage(product.image_url || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addStock = async (product) => {
    const value = window.prompt(`Tambah stok untuk ${product.name}`, "1");
    const amount = Number(value);

    if (!Number.isInteger(amount) || amount <= 0) {
      return;
    }

    try {
      await api.patch(`/admin/products/${product.id}/stock`, {
        addStock: amount
      });
      setMessage("Stok berhasil ditambahkan.");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menambahkan stok.");
    }
  };

  const deleteProduct = async (product) => {
    if (!window.confirm(`Hapus produk ${product.name}?`)) {
      return;
    }

    setMessage("");
    setError("");

    try {
      await api.delete(`/admin/products/${product.id}`);
      setMessage("Produk berhasil dihapus.");
      if (editing === product.id) {
        setEditing(null);
        setForm(empty);
        setImageFile(null);
        setCurrentImage("");
      }
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menghapus produk.");
    }
  };

  return (
    <section>
      <h1 className="text-2xl font-black">Produk</h1>
      {message && <div className="mt-4 rounded-md bg-green-50 p-3 text-sm font-semibold text-green-700">{message}</div>}
      {error && <div className="mt-4 rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}
      <form onSubmit={save} className="card mt-6 grid gap-3 p-5 md:grid-cols-3">
        <input className="input" placeholder="Nama" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option value="minuman_sehat">Minuman Sehat</option><option value="minuman_energi">Minuman Energi</option><option value="suplemen">Suplemen</option></select>
        <input className="input" placeholder="Harga" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <input className="input" placeholder="Stok" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
        {currentImage && (
          <div className="flex items-center gap-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
            <img src={currentImage} alt="Gambar produk saat ini" className="h-12 w-12 rounded-md object-cover" />
            <span className="text-sm font-semibold text-gray-600">Gambar saat ini</span>
          </div>
        )}
        <label className="md:col-span-3">
          <span className="mb-2 block text-sm font-bold text-gray-700">Upload / Ganti Gambar Produk</span>
          <input className="input" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
        </label>
        <textarea className="input md:col-span-3" placeholder="Deskripsi" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div className="flex flex-col gap-3 md:col-span-3 md:flex-row">
          <button type="submit" className="btn-primary flex-1" disabled={saving}>
            {saving ? "Menyimpan..." : editing ? "Update Produk" : "Tambah Produk"}
          </button>
          {editing && <button type="button" className="btn-outline flex-1" onClick={() => { setEditing(null); setForm(empty); setImageFile(null); setCurrentImage(""); setError(""); setMessage(""); }}>Batal Edit</button>}
        </div>
      </form>
      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50"><tr><th className="p-3">Gambar</th><th>Nama</th><th>Kategori</th><th>Harga</th><th>Stok</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>{products.map((p) => <tr className="border-t" key={p.id}><td className="p-3">{p.image_url ? <img src={p.image_url} alt={p.name} className="h-12 w-12 rounded object-cover" /> : <div className="h-12 w-12 rounded bg-gray-100" />}</td><td>{p.name}</td><td>{p.category}</td><td>{formatRupiah(p.price)}</td><td className="font-bold">{p.stock}</td><td>{p.is_active ? "Aktif" : "Nonaktif"}</td><td><button type="button" className="font-bold text-primary" onClick={() => editProduct(p)}>Edit</button><button type="button" className="ml-3 font-bold text-green-700" onClick={() => addStock(p)}>Tambah Stok</button><button type="button" className="ml-3 font-bold text-red-600" onClick={() => deleteProduct(p)}>Hapus</button></td></tr>)}</tbody>
        </table>
      </div>
    </section>
  );
}
