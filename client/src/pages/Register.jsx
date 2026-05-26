import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await register(form);
      navigate("/products");
    } catch (err) {
      setError(err.response?.data?.message || "Registrasi gagal.");
    }
  };

  return (
    <main className="section-shell flex min-h-[70vh] items-center justify-center py-14">
      <form onSubmit={handleSubmit} className="card w-full max-w-md p-6">
        <h1 className="text-2xl font-black">Daftar Akun</h1>
        {error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="mt-5 space-y-4">
          <input className="input" placeholder="Nama" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input" placeholder="Nomor telepon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className="input" type="password" placeholder="Password minimal 8 karakter" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button className="btn-primary w-full">Daftar</button>
        </div>
        <p className="mt-4 text-sm text-gray-600">Sudah punya akun? <Link className="font-bold text-primary" to="/login">Login</Link></p>
      </form>
    </main>
  );
}
