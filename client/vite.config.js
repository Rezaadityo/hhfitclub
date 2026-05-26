import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
  },

  build: {
    // Chunk size warning threshold (Cloudflare Pages limit 25MB per file, tapi best practice < 1MB)
    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {
        // Manual chunk splitting agar tidak ada 1 file JS raksasa
        manualChunks: {
          // Vendor utama React
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          // Chart library
          "vendor-charts": ["recharts"],
          // Animation
          "vendor-motion": ["framer-motion"],
          // Icons
          "vendor-icons": ["lucide-react", "react-icons"],
          // HTTP client & state
          "vendor-utils": ["axios", "zustand"],
        },
      },
    },

    // Source map di production untuk debugging (opsional, bisa false)
    sourcemap: false,

    // Target browser modern
    target: "es2015",
  },
});
