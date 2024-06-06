import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode } : { mode: string }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [
      remix({
        ssr: false,
        future: {
          v3_fetcherPersist: true,
          v3_relativeSplatPath: true,
          v3_throwAbortReason: true,
        },
      }),
      tsconfigPaths(),
    ],
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
      },
    },
  }
});
