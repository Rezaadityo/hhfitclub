import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer id="contact" className="bg-gray-950 py-12 text-white">
      <div className="section-shell grid gap-8 md:grid-cols-4">
        <div>
          <h3 className="text-xl font-black">HH FIT CLUB</h3>
          <p className="mt-3 text-sm leading-6 text-gray-300">UMKM kebugaran dan minuman kesehatan untuk gaya hidup aktif, sehat, dan konsisten.</p>
        </div>
        <div>
          <h4 className="font-bold">Menu Cepat</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-gray-300">
            <Link to="/products">Produk</Link>
            <Link to="/orders">Riwayat Pesanan</Link>
            <Link to="/login">Login</Link>
          </div>
        </div>
        <div>
          <h4 className="font-bold">Kontak</h4>
          <div className="mt-3 space-y-2 text-sm text-gray-300">
            <p className="flex gap-2"><MapPin size={16} /> Jl. Sehat No. 10, Indonesia</p>
            <p className="flex gap-2"><Phone size={16} /> 0812-3456-7890</p>
            <p className="flex gap-2"><Mail size={16} /> hello@hhfitclub.com</p>
          </div>
        </div>
        <div>
          <h4 className="font-bold">Jam Buka</h4>
          <p className="mt-3 text-sm text-gray-300">Senin - Sabtu<br />06.00 - 21.00 WIB</p>
          <div className="mt-4 flex gap-3">
            <Instagram />
            <Facebook />
          </div>
        </div>
      </div>
    </footer>
  );
}
