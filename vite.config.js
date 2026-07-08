import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    proxy: {
      "/api": {
        target: process.env.PROXY_URL || "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "prop-types": path.resolve(__dirname, "node_modules/prop-types"),
    },
  },
  optimizeDeps: {
    include: ["prop-types"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("prop-types")) return "prop-types";
	}
      },
    },
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    outDir: "dist",
    sourcemap: false,
  },
});
