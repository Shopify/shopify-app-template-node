import react from "@vitejs/plugin-react";
import "dotenv/config";
import { defineConfig } from "vite";

const config = defineConfig({
  define: {
    "process.env.SHOPIFY_API_KEY": JSON.stringify(process.env.SHOPIFY_API_KEY),
  },
  plugins: [react()],

  // TODO: Would this be nicer as a plugin imported from a package?
  // That way we can update the implementation, without having to update 3P code
  server: {
    proxy: {
      "^/api/.*": {
        target: "http://localhost:8081",
        changeOrigin: false,
        secure: true,
      },
      "/$": {
        target: "http://localhost:8081",
        changeOrigin: false,
        secure: true,
      },
    },
  },
});


export default config;
