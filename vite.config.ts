// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// import path from "path";
// import { componentTagger } from "lovable-tagger";

// // https://vitejs.dev/config/
// export default defineConfig(({ mode }) => ({
//   server: {
//     host: "::",
//     port: 5173,
//   },
//   plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "./src"),
//     },
//   },
// }));




import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// ✅ Clean, production-ready config for Vercel deployment
export default defineConfig({
  server: {
    host: "0.0.0.0", // Works with Vercel preview and local dev
    port: 5173,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // ✅ keep using @ alias
    },
  },
  build: {
    outDir: "dist", // ✅ Required by Vercel
    sourcemap: false,
  },
});
