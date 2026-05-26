import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "../../services/api.js";
import { formatRupiah } from "../../utils/format.js";

export default function AdminReports() {
  const [period, setPeriod] = useState("daily");
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [finance, setFinance] = useState(null);

  useEffect(() => {
    api.get("/admin/reports/sales", { params: { period } }).then((res) => setSales(res.data.data));
    api.get("/admin/reports/best-products").then((res) => setProducts(res.data.data));
    api.get("/admin/reports/finance").then((res) => setFinance(res.data.data));
  }, [period]);

  const exportCsv = () => {
    const csv = [
      "label,total,count",
      ...sales.map((row) => `${row.label},${row.total},${row.count}`),
      "",
      "Ringkasan Keuangan",
      `Omzet,${finance?.grossRevenue || 0}`,
      `Produk,${finance?.productRevenue || 0}`,
      `Membership,${finance?.membershipRevenue || 0}`,
      `Order Lunas,${finance?.paidOrders || 0}`
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `laporan-${period}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-2xl font-black">Laporan Keuangan</h1>
        <button className="btn-primary" onClick={exportCsv}>Export CSV</button>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <div className="card p-5"><p className="text-sm text-gray-500">Omzet Masuk</p><p className="mt-2 text-2xl font-black">{formatRupiah(finance?.grossRevenue)}</p></div>
        <div className="card p-5"><p className="text-sm text-gray-500">Revenue Produk</p><p className="mt-2 text-2xl font-black">{formatRupiah(finance?.productRevenue)}</p></div>
        <div className="card p-5"><p className="text-sm text-gray-500">Revenue Membership</p><p className="mt-2 text-2xl font-black">{formatRupiah(finance?.membershipRevenue)}</p></div>
        <div className="card p-5"><p className="text-sm text-gray-500">Order Lunas</p><p className="mt-2 text-2xl font-black">{finance?.paidOrders || 0}</p></div>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="card p-5"><p className="text-sm text-gray-500">Order Pending</p><p className="mt-2 text-xl font-black">{finance?.pendingOrders || 0}</p></div>
        <div className="card p-5"><p className="text-sm text-gray-500">Order Batal</p><p className="mt-2 text-xl font-black">{finance?.failedOrders || 0}</p></div>
        <div className="card p-5"><p className="text-sm text-gray-500">Rata-rata Order</p><p className="mt-2 text-xl font-black">{formatRupiah(finance?.averageOrderValue)}</p></div>
      </div>
      <div className="mt-5 flex gap-2">{["daily", "weekly", "monthly"].map((item) => <button key={item} className={`rounded-md px-4 py-2 text-sm font-bold ${period === item ? "bg-primary text-white" : "bg-white"}`} onClick={() => setPeriod(item)}>{item}</button>)}</div>
      <div className="card mt-6 h-80 p-5"><ResponsiveContainer width="100%" height="100%"><BarChart data={sales}><XAxis dataKey="label" /><YAxis /><Tooltip /><Bar dataKey="total" fill="#16a34a" /></BarChart></ResponsiveContainer></div>
      <div className="card mt-6 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-50"><tr><th className="p-3">Produk</th><th>Total Terjual</th><th>Total Revenue</th></tr></thead><tbody>{products.map((row) => <tr className="border-t" key={row.product_id}><td className="p-3">{row.product?.name}</td><td>{row.totalSold}</td><td>{formatRupiah(row.totalRevenue)}</td></tr>)}</tbody></table></div>
    </section>
  );
}
