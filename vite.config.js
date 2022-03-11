import react from "@vitejs/plugin-react";
import "dotenv/config";

import pjson from "./node_modules/@shopify/shopify-api/package.json" assert { type: "json" };

/**
 * @type {import('vite').UserConfig}
 */
export default {
  define: {
    "process.env.SHOPIFY_API_KEY": JSON.stringify(process.env.SHOPIFY_API_KEY),
    SHOPIFY_LIBRARY_VERSION: JSON.stringify(pjson.version),
  },
  plugins: [react()],
};
