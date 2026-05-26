import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import useCartStore from "../context/useCartStore.js";
import api from "../services/api.js";
import { formatRupiah } from "../utils/format.js";

// Channel pembayaran Duitku yang tampil di checkout
const CHANNELS = [
  { code: "QR",  name: "QRIS",             icon: "📱", info: "Semua e-wallet & bank" },
  { code: "OV",  name: "OVO",              icon: "💜", info: "OVO Balance" },
  { code: "DA",  name: "DANA",             icon: "💙", info: "DANA" },
  { code: "SP",  name: "ShopeePay",        icon: "🧡", info: "ShopeePay" },
  { code: "BV",  name: "BNI VA",           icon: "🏦", info: "Virtual Account BNI" },
  { code: "I1",  name: "BRI VA",           icon: "🏦", info: "Virtual Account BRI" },
  { code: "M2",  name: "Mandiri VA",       icon: "🏦", info: "Virtual Account Mandiri" },
  { code: "FT",  name: "Alfamart / Indomaret", icon: "🏪", info: "Bayar di gerai" },
];

export default function Checkout() {
  const navigate      = useNavigate();
  const [searchParams] = useSearchParams();
  const { user }      = useAuth();
  const { items, total, clearCart } = useCartStore();

  const membershipId = searchParams.get("membershipId");
  const isMembershipCheckout = Boolean(membershipId);

  const [form, setForm]         = useState({ receiverName: user?.name || "", phone: user?.phone || "", note: "" });
  const [selectedMethod, setSelectedMethod] = useState("QR");
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const checkoutTotal = useMemo(() =>
    isMembershipCheckout ? Number(selectedMembership?.price || 0) : total(),
  [isMembershipCheckout, selectedMembership?.price, total]);

  useEffect(() => {
    if (!membershipId) return;
    api.get(`/memberships/${membershipId}`)
      .then((res) => setSelectedMembership(res.data.data))
      .catch(() => setError("Paket membership tidak ditemukan atau tidak aktif."));
  }, [membershipId]);

  if (!user) return <Navigate to="/login" replace />;

  const handlePay = async () => {
    if (!isMembershipCheckout && items.length === 0) return setError("Keranjang masih kosong.");
    if (isMembershipCheckout && !selectedMembership)  return setError("Paket membership belum siap.");

    setLoading(true);
    setError("");

    try {
      // 1. Buat order
      const orderPayload = isMembershipCheckout
        ? { membershipId: Number(membershipId), ...form }
        : { items: items.map((i) => ({ productId: i.id, quantity: i.quantity })), ...form };

      const orderRes = await api.post("/orders", orderPayload);
      const order    = orderRes.data.data;

      if (!isMembershipCheckout) clearCart();

      // 2. Buat transaksi Duitku
      const payRes = await api.post(`/duitku/create/${order.id}`, { paymentMethod: selectedMethod });
      const pData  = payRes.data.data;

      setPaymentResult({ ...pData, orderId: order.id });

      // 3. Redirect ke payment page Duitku (popup / redirect)
      if (pData.paymentUrl) {
        window.open(pData.paymentUrl, "_blank", "width=600,height=700");
      }

    } catch (err) {
      setError(err.response?.data?.message || "Gagal membuat pembayaran.");
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async () => {
    if (!paymentResult?.orderId) return;
    try {
      const res = await api.get(`/duitku/status/${paymentResult.orderId}`);
      const d   = res.data.data;
      if (d.orderStatus === "paid") {
        navigate(`/order-success/${paymentResult.orderId}`, { replace: true });
      } else {
        setError(`Status pembayaran: ${d.paymentStatus || "pending"}. Selesaikan pembayaran dan coba lagi.`);
      }
    } catch {
      setError("Gagal mengecek status pembayaran.");
    }
  };

  return (
    <main className="section-shell grid gap-8 py-12 lg:grid-cols-[1fr_420px]">

      {/* Kiri: form + pilih metode */}
      <section>
        <div className="card p-6">
          <h1 className="text-2xl font-black">Checkout</h1>
          {error && <div className="mt-4 rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <input className="input" placeholder="Nama penerima"
              value={form.receiverName} onChange={(e) => setForm({ ...form, receiverName: e.target.value })} />
            <input className="input" placeholder="Nomor telepon"
              value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <textarea className="input md:col-span-2" rows="3" placeholder="Catatan order (opsional)"
              value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </div>
        </div>

        {/* Pilih metode pembayaran */}
        {!paymentResult && (
          <div className="card mt-4 p-6">
            <h2 className="font-black text-gray-800 mb-4">Metode Pembayaran</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {CHANNELS.map((ch) => (
                <button
                  key={ch.code}
                  type="button"
                  onClick={() => setSelectedMethod(ch.code)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-center transition
                    ${selectedMethod === ch.code
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-primary/50"}`}
                >
                  <span className="text-xl">{ch.icon}</span>
                  <span className="text-xs font-bold text-gray-800 leading-tight">{ch.name}</span>
                  <span className="text-[10px] text-gray-400">{ch.info}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Hasil pembayaran — tampil setelah order dibuat */}
        {paymentResult && (
          <div className="card mt-4 p-6 text-center">
            <div className="text-4xl mb-3">🎉</div>
            <h2 className="text-lg font-black text-gray-800">Pembayaran Dibuat!</h2>
            <p className="mt-2 text-sm text-gray-600">
              Halaman pembayaran Duitku sudah dibuka di tab baru. Selesaikan pembayaran di sana,
              lalu klik tombol di bawah untuk konfirmasi.
            </p>
            {paymentResult.vaNumber && (
              <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm">
                <p className="text-gray-500">Nomor Virtual Account</p>
                <p className="text-xl font-black tracking-widest">{paymentResult.vaNumber}</p>
              </div>
            )}
            <p className="mt-3 font-black text-xl text-primary">{formatRupiah(paymentResult.amount)}</p>

            <div className="mt-5 flex flex-col gap-3">
              <button onClick={checkStatus} className="btn-primary w-full">
                ✅ Saya Sudah Membayar — Cek Status
              </button>
              {paymentResult.paymentUrl && (
                <a href={paymentResult.paymentUrl} target="_blank" rel="noreferrer"
                  className="btn-outline w-full text-center">
                  🔗 Buka Ulang Halaman Pembayaran
                </a>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Kanan: ringkasan order */}
      <aside className="card h-max p-6">
        <h2 className="text-xl font-black">Ringkasan Order</h2>
        <div className="mt-4 space-y-3">
          {isMembershipCheckout && selectedMembership ? (
            <div className="flex justify-between gap-4 text-sm">
              <span>{selectedMembership.name} × 1</span>
              <span className="font-bold">{formatRupiah(selectedMembership.price)}</span>
            </div>
          ) : (
            items.map((item) => (
              <div className="flex justify-between gap-4 text-sm" key={item.id}>
                <span>{item.name} × {item.quantity}</span>
                <span className="font-bold">{formatRupiah(item.price * item.quantity)}</span>
              </div>
            ))
          )}
        </div>
        <div className="mt-5 flex justify-between border-t pt-4 text-lg font-black">
          <span>Total</span>
          <span>{formatRupiah(checkoutTotal)}</span>
        </div>
        {!paymentResult && (
          <button
            className="btn-primary mt-5 w-full"
            disabled={checkoutTotal <= 0 || loading}
            onClick={handlePay}
          >
            {loading
              ? "Memproses…"
              : `Bayar via ${CHANNELS.find((c) => c.code === selectedMethod)?.name || "Duitku"}`}
          </button>
        )}
        <p className="mt-3 text-center text-xs text-gray-400">
          🔒 Pembayaran diproses oleh <strong>Duitku</strong> — payment gateway Indonesia yang aman.
        </p>
      </aside>
    </main>
  );
}
