import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const baseUrl = (env.VITE_N8N_BASE_URL || "").trim();
  let proxy = undefined;
  if (baseUrl.startsWith("http")) {
    const url = new URL(baseUrl);
    const path = url.pathname.replace(/\/+$/, "") || "/";
    proxy = {
      [path]: {
        target: url.origin,
        changeOrigin: true,
      },
    };
  } else if (baseUrl) {
    proxy = {
      [baseUrl]: {
        target: "http://localhost:5678",
        changeOrigin: true,
      },
    };
  }

  return {
    plugins: [react()],
    envDir: ".",
    base: "/app/",
    define: {
      "import.meta.env.VITE_N8N_BASE_URL": JSON.stringify(baseUrl),
    },
    server: {
      port: 5173,
      proxy,
    },
  };
});
