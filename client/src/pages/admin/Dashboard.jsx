import { useEffect, useState } from "react";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import api from "../../services/api.js";
import { formatRupiah } from "../../utils/format.js";

export default function Dashboard() {
  const [summary, setSummary] = useState({});
  const [sales, setSales] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    api.get("/admin/dashboard/summary").then((res) => setSummary(res.data.data));
    api.get("/admin/reports/sales", { params: { period: "daily" } }).then((res) => setSales(res.data.data));
    api.get("/admin/transactions", { params: { limit: 5 } }).then((res) => setTransactions(res.data.data.data));
  }, []);

  const cards = [
    ["Revenue Hari Ini", formatRupiah(summary.revenueToday)],
    ["Total Order Bulan Ini", summary.totalOrders || 0],
    ["Member Terdaftar", summary.totalMembers || summary.totalCustomers || 0],
    ["Produk Aktif", summary.activeProducts || 0]
  ];

  return (
    <section>
      <h1 className="text-2xl font-black">Dashboard</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-4">{cards.map(([label, value]) => <div className="card p-5" key={label}><p className="text-sm text-gray-500">{label}</p><p className="mt-2 text-2xl font-black">{value}</p></div>)}</div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_420px]">
        <div className="card p-5">
          <h2 className="font-black">Penjualan</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sales}><XAxis dataKey="label" /><YAxis /><Tooltip /><Line type="monotone" dataKey="total" stroke="#16a34a" strokeWidth={3} /></LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-5">
          <h2 className="font-black">5 Transaksi Terbaru</h2>
          <div className="mt-4 space-y-3">{transactions.map((item) => <div key={item.id} className="flex justify-between border-b pb-3 text-sm"><span>#{item.id} {item.user?.name}</span><b>{formatRupiah(item.total_price)}</b></div>)}</div>
        </div>
      </div>
    </section>
  );
}
