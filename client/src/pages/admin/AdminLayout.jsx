import { BarChart3, Boxes, CreditCard, LayoutDashboard, LogOut, Users, BadgePercent, Landmark } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const menus = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
  { label: "Produk", to: "/admin/products", icon: Boxes },
  { label: "Membership", to: "/admin/memberships", icon: BadgePercent },
  { label: "Transaksi", to: "/admin/transactions", icon: CreditCard },
  { label: "Laporan", to: "/admin/reports", icon: BarChart3 },
  { label: "Member", to: "/admin/customers", icon: Users },
  { label: "Payment Gateway", to: "/admin/payment-gateway", icon: Landmark }
];

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="bg-gray-950 p-5 text-white">
        <div className="text-xl font-black">HH FIT CLUB</div>
        <nav className="mt-8 grid gap-2">
          {menus.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === "/admin"} className={({ isActive }) => `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-bold ${isActive ? "bg-primary" : "text-gray-300 hover:bg-white/10"}`}>
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div>
        <header className="flex h-16 items-center justify-between bg-white px-6 shadow-sm">
          <div>
            <p className="text-sm text-gray-500">Admin</p>
            <p className="font-bold">{user?.name}</p>
          </div>
          <button className="btn-outline" onClick={logout}><LogOut size={16} /> Logout</button>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
