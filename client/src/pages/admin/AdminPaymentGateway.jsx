import { useEffect, useState } from "react";
import {
  CreditCard, CheckCircle, XCircle, AlertCircle,
  Eye, EyeOff, Save, RefreshCw, Zap, Globe
} from "lucide-react";
import api from "../../services/api.js";

// ── Field konfigurasi Duitku ──
const DUITKU_FIELDS = [
  {
    key: "DUITKU_MERCHANT_CODE",
    label: "Merchant Code",
    placeholder: "Contoh: DS12345",
    hint: "Ditemukan di Dashboard Duitku → Profil Merchant",
    secret: false,
  },
  {
    key: "DUITKU_API_KEY",
    label: "API Key",
    placeholder: "API Key dari Duitku",
    hint: "Ditemukan di Dashboard Duitku → Integrasi",
    secret: true,
  },
  {
    key: "DUITKU_CALLBACK_URL",
    label: "Callback URL (Webhook)",
    placeholder: "https://api.domainanda.com/api/duitku/callback",
    hint: "URL server Anda yang akan menerima notifikasi dari Duitku. Harus HTTPS di production.",
    secret: false,
  },
  {
    key: "DUITKU_RETURN_URL",
    label: "Return URL",
    placeholder: "https://domainanda.com/order-success",
    hint: "Halaman yang dituju setelah member selesai membayar.",
    secret: false,
  },
];

const PAYMENT_CHANNELS = [
  { code: "QR",  name: "QRIS",             icon: "📱", type: "QRIS",            popular: true  },
  { code: "OV",  name: "OVO",              icon: "💜", type: "E-Wallet",        popular: true  },
  { code: "DA",  name: "DANA",             icon: "💙", type: "E-Wallet",        popular: true  },
  { code: "SP",  name: "ShopeePay",        icon: "🧡", type: "E-Wallet",        popular: true  },
  { code: "LA",  name: "LinkAja",          icon: "❤️",  type: "E-Wallet",        popular: false },
  { code: "BV",  name: "BNI Virtual Account",icon: "🏦", type: "Virtual Account", popular: true  },
  { code: "I1",  name: "BRI Virtual Account",icon: "🏦", type: "Virtual Account", popular: true  },
  { code: "M2",  name: "Mandiri VA",       icon: "🏦", type: "Virtual Account", popular: true  },
  { code: "B1",  name: "CIMB Niaga VA",   icon: "🏦", type: "Virtual Account", popular: false },
  { code: "FT",  name: "Alfamart / Indomaret",icon:"🏪", type: "Retail",         popular: false },
];

function StatusBadge({ configured }) {
  return configured ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
      <CheckCircle size={12} /> Aktif
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
      <XCircle size={12} /> Belum Dikonfigurasi
    </span>
  );
}

export default function AdminPaymentGateway() {
  const [config, setConfig]         = useState({
    DUITKU_MERCHANT_CODE: "",
    DUITKU_API_KEY: "",
    DUITKU_CALLBACK_URL: "",
    DUITKU_RETURN_URL: "",
    DUITKU_ENV: "sandbox",
  });
  const [showSecret, setShowSecret] = useState({});
  const [status, setStatus]         = useState(null); // { configured, env, merchantCode }
  const [saving, setSaving]         = useState(false);
  const [testing, setTesting]       = useState(false);
  const [toast, setToast]           = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadStatus = async () => {
    try {
      const res = await api.get("/admin/payment-gateway/status");
      setStatus(res.data.data);
      if (res.data.data?.currentConfig) {
        setConfig((prev) => ({ ...prev, ...res.data.data.currentConfig }));
      }
    } catch {
      // status tidak wajib ada
    }
  };

  useEffect(() => { loadStatus(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post("/admin/payment-gateway/config", config);
      showToast("Konfigurasi Duitku berhasil disimpan! Restart server untuk menerapkan perubahan.");
      await loadStatus();
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal menyimpan konfigurasi.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const res = await api.post("/admin/payment-gateway/test");
      showToast(`✅ Koneksi Duitku berhasil! ${res.data.data?.message || ""}`);
    } catch (err) {
      showToast(`❌ ${err.response?.data?.message || "Koneksi Duitku gagal. Periksa Merchant Code & API Key."}`, "error");
    } finally {
      setTesting(false);
    }
  };

  const isConfigured = Boolean(config.DUITKU_MERCHANT_CODE && config.DUITKU_API_KEY);

  return (
    <section className="max-w-4xl">
      {/* Toast */}
      {toast && (
        <div className={`fixed right-5 top-5 z-[9999] max-w-sm rounded-xl px-5 py-3.5 text-sm font-semibold text-white shadow-xl
          ${toast.type === "error" ? "bg-red-500" : "bg-green-600"}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black">Payment Gateway</h1>
          <p className="mt-1 text-sm text-gray-500">Konfigurasi Duitku sebagai payment gateway utama toko Anda.</p>
        </div>
        <StatusBadge configured={isConfigured} />
      </div>

      {/* Banner info Duitku */}
      <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🇮🇩</div>
          <div>
            <p className="font-bold text-blue-900">Duitku — Payment Gateway Lokal Indonesia</p>
            <p className="mt-1 text-sm text-blue-700">
              Duitku mendukung QRIS, OVO, DANA, ShopeePay, Virtual Account semua bank, dan Alfamart/Indomaret.
              Daftar di <a href="https://www.duitku.com" target="_blank" rel="noreferrer" className="font-bold underline hover:text-blue-900">duitku.com</a> untuk mendapatkan Merchant Code dan API Key.
            </p>
          </div>
        </div>
      </div>

      {/* Environment toggle */}
      <div className="mt-6 card p-5">
        <p className="text-sm font-bold text-gray-700 mb-3">Environment</p>
        <div className="flex gap-3">
          {["sandbox", "production"].map((env) => (
            <button
              key={env}
              onClick={() => setConfig({ ...config, DUITKU_ENV: env })}
              className={`flex-1 rounded-lg border-2 py-3 text-sm font-bold transition
                ${config.DUITKU_ENV === env
                  ? env === "production"
                    ? "border-green-500 bg-green-50 text-green-800"
                    : "border-primary bg-primary/10 text-primary"
                  : "border-gray-200 text-gray-500 hover:border-gray-400"}`}
            >
              {env === "sandbox" ? "🧪 Sandbox (Testing)" : "🚀 Production (Live)"}
            </button>
          ))}
        </div>
        {config.DUITKU_ENV === "production" && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-yellow-50 px-4 py-2.5 text-xs font-semibold text-yellow-800">
            <AlertCircle size={14} />
            Mode Production aktif — transaksi akan diproses dengan uang nyata.
          </div>
        )}
      </div>

      {/* Form konfigurasi */}
      <div className="mt-4 card p-5">
        <p className="font-bold text-gray-800 mb-4">Kredensial API</p>
        <div className="space-y-4">
          {DUITKU_FIELDS.map((field) => (
            <div key={field.key}>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">
                {field.label}
              </label>
              <div className="relative">
                <input
                  type={field.secret && !showSecret[field.key] ? "password" : "text"}
                  className="input w-full pr-10"
                  placeholder={field.placeholder}
                  value={config[field.key] || ""}
                  onChange={(e) => setConfig({ ...config, [field.key]: e.target.value })}
                />
                {field.secret && (
                  <button
                    type="button"
                    onClick={() => setShowSecret((p) => ({ ...p, [field.key]: !p[field.key] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showSecret[field.key] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-400">{field.hint}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            <Save size={16} />
            {saving ? "Menyimpan…" : "Simpan Konfigurasi"}
          </button>
          <button
            onClick={handleTest}
            disabled={testing || !isConfigured}
            className="flex items-center gap-2 rounded-lg border-2 border-primary px-5 py-2.5 text-sm font-bold text-primary hover:bg-primary/10 disabled:opacity-40 transition"
          >
            <Zap size={16} />
            {testing ? "Menguji…" : "Test Koneksi"}
          </button>
          <button
            onClick={loadStatus}
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition"
          >
            <RefreshCw size={15} /> Refresh Status
          </button>
        </div>

        <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800 font-medium">
          ⚠️ Setelah menyimpan konfigurasi, <strong>restart server Node.js</strong> agar perubahan .env diterapkan.
        </div>
      </div>

      {/* Channel pembayaran */}
      <div className="mt-6 card p-5">
        <p className="font-bold text-gray-800 mb-1">Channel Pembayaran yang Didukung</p>
        <p className="text-xs text-gray-400 mb-4">Semua channel di bawah aktif otomatis sesuai konfigurasi akun Duitku Anda.</p>

        {["QRIS", "E-Wallet", "Virtual Account", "Retail"].map((type) => (
          <div key={type} className="mb-4">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">{type}</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {PAYMENT_CHANNELS.filter((c) => c.type === type).map((ch) => (
                <div
                  key={ch.code}
                  className="flex items-center gap-2.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5"
                >
                  <span className="text-lg">{ch.icon}</span>
                  <div>
                    <p className="text-xs font-bold text-gray-800">{ch.name}</p>
                    <p className="text-[10px] text-gray-400">Kode: {ch.code}</p>
                  </div>
                  {ch.popular && (
                    <span className="ml-auto rounded-full bg-green-100 px-1.5 py-0.5 text-[9px] font-bold text-green-700">
                      Populer
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Panduan integrasi */}
      <div className="mt-6 card p-5">
        <p className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Globe size={16} /> Panduan Setup Cepat
        </p>
        <ol className="space-y-2.5 text-sm text-gray-600">
          {[
            <>Daftar akun di <a href="https://www.duitku.com" target="_blank" rel="noreferrer" className="text-primary font-semibold underline">duitku.com</a> dan buat Proyek baru.</>,
            "Salin Merchant Code dan API Key dari Dashboard Duitku → Proyek → Detail.",
            "Isi form di atas, pilih environment Sandbox untuk testing.",
            <>Set <strong>Callback URL</strong> di Dashboard Duitku (menu Integrasi) dengan URL yang sama yang Anda isi di form ini.</>,
            "Klik 'Test Koneksi' — jika sukses, konfigurasi sudah benar.",
            "Setelah testing selesai, ganti environment ke Production dan isi ulang API Key production.",
          ].map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-black text-primary">
                {i + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
