import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const user = await login(form);
      navigate(user.role === "admin" ? "/admin" : "/products");
    } catch (err) {
      setError(err.response?.data?.message || "Login gagal.");
    }
  };

  return (
    <main className="section-shell flex min-h-[70vh] items-center justify-center py-14">
      <form onSubmit={handleSubmit} className="card w-full max-w-md p-6">
        <h1 className="text-2xl font-black">Login</h1>
        {error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="mt-5 space-y-4">
          <input className="input" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button className="btn-primary w-full">Masuk</button>
        </div>
        <p className="mt-4 text-sm text-gray-600">Belum punya akun? <Link className="font-bold text-primary" to="/register">Daftar</Link></p>
      </form>
    </main>
  );
}
