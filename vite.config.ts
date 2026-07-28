import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    // Safari 14 is the oldest supported mobile target. ES2020 avoids
    // down-transforming Tesseract's worker bundle while remaining compatible.
    target: "es2020",
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    port: 3000,
  },
});
