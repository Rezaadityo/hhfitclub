import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function CTABanner() {
  const { isAuthenticated, user } = useAuth();

  return (
    <section className="bg-primary py-14 text-white">
      <div className="section-shell flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-black">{isAuthenticated ? `Siap latihan lagi, ${user?.name}?` : "Mulai rutinitas fit kamu hari ini."}</h2>
          <p className="mt-2 text-green-50">{isAuthenticated ? "Pilih produk atau membership yang kamu butuhkan hari ini." : "Daftar akun, pilih produk, dan bayar mudah dengan QRIS."}</p>
        </div>
        {isAuthenticated ? (
          <Link className="rounded-md bg-white px-5 py-3 font-bold text-primary hover:bg-gray-100" to="/products">Belanja Produk</Link>
        ) : (
          <Link className="rounded-md bg-white px-5 py-3 font-bold text-primary hover:bg-gray-100" to="/register">Daftar Sekarang</Link>
        )}
      </div>
    </section>
  );
}
