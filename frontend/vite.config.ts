import { defineConfig, loadEnv } from "vite";
import preact from "@preact/preset-vite";

// https://vitejs.dev/config/
export default defineConfig(
  ({ mode }: { mode: string }) => {
    const env = loadEnv(mode, process.cwd(), "");
    return {
      plugins: [preact()],
      build: {
        target: "es2015",
      },
      server: {
        proxy: {
          "^/api.*": {
            target: env.API_URL,
            secure: false,
            changeOrigin: true,
          },
          "^/graphql": {
            target: env.API_URL + "graphql",
            secure: false,
            changeOrigin: true,
          },
        },
      },
    };
  });
