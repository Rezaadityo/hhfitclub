import { CheckCircle2, ExternalLink, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import { formatRupiah } from "../utils/format.js";
import { loadMidtransSnap } from "../utils/loadMidtransSnap.js";

const merchantQrisImage = "/images/hhfitclub-qris.jpeg";

export default function PaymentModal({ payment, orderId, onClose }) {
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(15 * 60);
  const [confirming, setConfirming] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [error, setError] = useState("");
  const expiredTime = useMemo(() => new Date(payment.expired_at).getTime(), [payment.expired_at]);

  const finishPayment = useCallback(() => {
    setIsPaid(true);
    window.setTimeout(() => {
      navigate("/", { replace: true });
    }, 1500);
  }, [navigate]);

  const confirmPayment = useCallback(async () => {
    if (!orderId || confirming) {
      return;
    }

    setConfirming(true);
    setError("");

    try {
      await api.post(`/payments/confirm/${orderId}`);
      finishPayment();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mengonfirmasi pembayaran.");
    } finally {
      setConfirming(false);
    }
  }, [confirming, finishPayment, orderId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(Math.max(0, Math.floor((expiredTime - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(timer);
  }, [expiredTime]);

  useEffect(() => {
    const poll = setInterval(async () => {
      const response = await api.get(`/payments/status/${orderId}`);
      if (response.data.data.orderStatus === "paid") {
        clearInterval(poll);
        finishPayment();
      }
    }, 5000);
    return () => clearInterval(poll);
  }, [finishPayment, orderId]);

  const canUseSnap = Boolean(payment?.token);

  useEffect(() => {
    const snapContainer = document.getElementById("snap-container");

    if (!canUseSnap || !snapContainer) {
      return;
    }

    loadMidtransSnap()
      .then((snap) => {
        if (!snap?.embed) {
          return;
        }

        snapContainer.innerHTML = "";
        snap.embed(payment.token, {
          embedId: "snap-container",
          onSuccess: () => confirmPayment(),
          onPending: () => {},
          onError: () => {},
          onClose: () => {}
        });
      })
      .catch(() => {});
  }, [canUseSnap, navigate, orderId, payment?.token]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black">Pembayaran QRIS</h2>
          <button onClick={onClose} className="rounded p-2 hover:bg-gray-100"><X size={20} /></button>
        </div>
        {isPaid && (
          <div className="mt-5 rounded-lg bg-green-50 p-4 text-center text-green-700">
            <CheckCircle2 className="mx-auto mb-2" size={36} />
            <p className="font-black">Pembayaran berhasil.</p>
            <p className="mt-1 text-sm">Kamu akan diarahkan kembali ke Home.</p>
          </div>
        )}
        {error && <div className="mt-4 rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}
        <div className="mt-5 rounded-lg bg-gray-50 p-5 text-center">
          <p className="text-sm text-gray-500">Nominal</p>
          <p className="mt-1 text-3xl font-black text-primary">{formatRupiah(payment.amount)}</p>
          <p className="mt-3 text-sm font-bold text-red-600">{mm}:{ss}</p>
        </div>
        <div className="mt-5 flex flex-col items-center">
          <div className="w-full rounded-lg border border-gray-200 bg-white p-3">
            <img src={merchantQrisImage} alt="QRIS HH FIT CLUB" className="mx-auto max-h-[420px] w-full object-contain" />
            <div className="mt-3 rounded-md bg-green-50 p-3 text-center">
              <p className="text-xs font-bold uppercase text-primary">Bayar sesuai nominal</p>
              <p className="mt-1 text-2xl font-black text-gray-950">{formatRupiah(payment.amount)}</p>
            </div>
          </div>
          {canUseSnap && (
            <div className="mt-4 w-full">
              <p className="mb-2 text-sm font-bold text-gray-700">Pembayaran otomatis Midtrans</p>
              <div id="snap-container" className="min-h-[320px] w-full overflow-hidden rounded-lg border border-gray-200 bg-white" />
            </div>
          )}
          {payment.redirect_url && (
            <a className="btn-outline mt-4 gap-2" href={payment.redirect_url} target="_blank" rel="noreferrer">
              <ExternalLink size={16} /> Buka Halaman Pembayaran
            </a>
          )}
          <button className="btn-primary mt-5 w-full" disabled={!orderId || confirming || isPaid} onClick={confirmPayment}>
            {confirming ? "Mengonfirmasi..." : "Saya Sudah Bayar"}
          </button>
          <p className="mt-4 flex items-center gap-2 text-sm text-gray-600"><CheckCircle2 size={16} className="text-primary" /> Setelah klik tombol, transaksi langsung dicatat selesai di database.</p>
        </div>
        <button className="btn-outline mt-5 w-full" onClick={onClose}>Batalkan</button>
      </div>
    </div>
  );
}
