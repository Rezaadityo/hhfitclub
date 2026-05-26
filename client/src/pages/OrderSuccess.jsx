import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api.js";
import { formatRupiah } from "../utils/format.js";

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then((response) => setOrder(response.data.data));
  }, [id]);

  return (
    <main className="section-shell flex min-h-[70vh] items-center justify-center py-12">
      <div className="card max-w-lg p-8 text-center">
        <CheckCircle2 className="mx-auto text-primary" size={72} />
        <h1 className="mt-4 text-3xl font-black">Pembayaran Berhasil</h1>
        <p className="mt-2 text-gray-600">Order #{id} sudah dibayar.</p>
        <p className="mt-4 text-2xl font-black text-primary">{formatRupiah(order?.total_price)}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link className="btn-primary" to="/orders">Lihat Riwayat Pesanan</Link>
          <Link className="btn-outline" to="/products">Kembali Belanja</Link>
        </div>
      </div>
    </main>
  );
}
