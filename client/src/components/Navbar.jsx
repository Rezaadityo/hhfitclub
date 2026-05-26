import { Menu, ShoppingCart, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useCartStore from "../context/useCartStore.js";
import { useAuth } from "../context/AuthContext.jsx";

const links = [
  { label: "Home", to: "/" },
  { label: "Produk", to: "/products" },
  { label: "Membership", to: "/memberships" },
  { label: "Tentang", to: "/#about" },
  { label: "Kontak", to: "/#contact" }
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { toggleCart, count } = useCartStore();
  const { user, logout } = useAuth();

  const closeMenu = () => setOpen(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const menu = (
    <>
      {links.map((link) => (
        <Link key={link.label} to={link.to} onClick={closeMenu} className="text-sm font-medium text-gray-700 hover:text-primary">
          {link.label}
        </Link>
      ))}
    </>
  );

  return (
    <header className={`sticky top-0 z-40 transition ${scrolled ? "bg-white/90 shadow-sm backdrop-blur" : "bg-white"}`}>
      <nav className="section-shell flex h-16 items-center justify-between">
        <Link to="/" className="leading-tight">
          <div className="text-lg font-black tracking-wide text-gray-950">HH FIT CLUB</div>
          <div className="text-[11px] font-semibold text-primary">Sehat dari Dalam, Kuat dari Luar</div>
        </Link>
        <div className="hidden items-center gap-6 md:flex">{menu}</div>
        <div className="hidden items-center gap-2 md:flex">
          <button type="button" onClick={toggleCart} className="relative rounded-md border border-gray-200 p-2 hover:border-primary" aria-label="Cart">
            <ShoppingCart size={19} />
            {count() > 0 && <span className="absolute -right-2 -top-2 rounded-full bg-primary px-1.5 text-xs font-bold text-white">{count()}</span>}
          </button>
          {user ? (
            <>
              {user.role === "admin" && <Link className="btn-outline" to="/admin">Admin</Link>}
              <Link className="btn-outline" to="/orders">Pesanan</Link>
              <button className="btn-primary" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link className="btn-outline" to="/login">Login</Link>
              <Link className="btn-primary" to="/register">Daftar</Link>
            </>
          )}
        </div>
        <button className="rounded-md border border-gray-200 p-2 md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>
      {open && (
        <div className="section-shell flex flex-col gap-4 border-t border-gray-100 py-4 md:hidden">
          {menu}
          <button type="button" onClick={toggleCart} className="btn-outline justify-start">Keranjang ({count()})</button>
          {user ? <button className="btn-primary" onClick={logout}>Logout</button> : <Link className="btn-primary" to="/login">Login</Link>}
        </div>
      )}
    </header>
  );
}
