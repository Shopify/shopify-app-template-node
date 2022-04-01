import { defineConfig } from "vite";
import dotenv from "dotenv";

// The .env file will actually be present in the parent repo
dotenv.config({ path: "../.env" });

export const PORT = 3000;

// prettier-ignore
const INDEX_ROUTE = "^/(\\?.*)?$";
const API_ROUTE = "^/api/";

export default defineConfig({
  root: process.cwd(),
  define: {
    "process.env.SHOPIFY_API_KEY": JSON.stringify(process.env.SHOPIFY_API_KEY),
  },
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
  server: {
    port: PORT,
    middlewareMode: "html",
    hmr: {
      protocol: "ws",
      host: "localhost",
      port: 64999,
      clientPort: 64999,
    },
    proxy: {
      [INDEX_ROUTE]: {
        target: "http://127.0.0.1:8081",
        changeOrigin: false,
        secure: true,
        ws: false,
      },
      [API_ROUTE]: {
        target: "http://127.0.0.1:8081",
        changeOrigin: false,
        secure: true,
        ws: false,
      },
    },
  },
});
