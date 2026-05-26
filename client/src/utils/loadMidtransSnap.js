let snapScriptPromise = null;

export const loadMidtransSnap = () => {
  if (window.snap) {
    return Promise.resolve(window.snap);
  }

  const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;

  if (!clientKey) {
    return Promise.reject(new Error("VITE_MIDTRANS_CLIENT_KEY belum diisi."));
  }

  if (snapScriptPromise) {
    return snapScriptPromise;
  }

  snapScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", clientKey);
    script.onload = () => resolve(window.snap);
    script.onerror = () => reject(new Error("Gagal memuat script Midtrans Snap."));
    document.body.appendChild(script);
  });

  return snapScriptPromise;
};
