import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";
import { formatRupiah } from "../utils/format.js";

const splitBenefits = (benefits) => {
  if (!benefits) {
    return [];
  }

  return benefits
    .split(/\n|,|;/)
    .map((item) => item.trim())
    .filter(Boolean);
};

export default function Memberships() {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/memberships")
      .then((response) => setMemberships(response.data.data))
      .catch(() => setError("Gagal mengambil data membership."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="bg-white py-14">
      <div className="section-shell">
        <div className="max-w-2xl">
          <p className="font-bold text-primary">Membership</p>
          <h1 className="mt-2 text-3xl font-black md:text-4xl">Paket latihan yang fleksibel.</h1>
          <p className="mt-4 leading-7 text-gray-600">Pilih paket HH FIT CLUB, lanjut checkout, lalu bayar dengan QRIS melalui Midtrans.</p>
        </div>

        {error && <div className="mt-8 rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}

        {loading ? (
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-96 animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        ) : (
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {memberships.map((membership) => (
              <article key={membership.id} className="card flex flex-col p-6">
                <div>
                  <h2 className="text-2xl font-black">{membership.name}</h2>
                  <p className="mt-2 text-sm font-semibold text-gray-500">{membership.duration_days} hari akses</p>
                  <p className="mt-5 text-3xl font-black text-primary">{formatRupiah(membership.price)}</p>
                </div>

                <ul className="mt-6 flex-1 space-y-3">
                  {splitBenefits(membership.benefits).map((benefit) => (
                    <li key={benefit} className="flex gap-2 text-sm leading-6 text-gray-700">
                      <CheckCircle2 className="mt-0.5 shrink-0 text-primary" size={18} />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>

                <Link className="btn-primary mt-8 w-full" to={`/checkout?membershipId=${membership.id}`}>
                  Pilih Paket
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
