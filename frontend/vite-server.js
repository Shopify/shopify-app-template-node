import express from "express";
import "dotenv/config";

const PORT = 3000;

async function createServer() {
  const app = express();

  const vite = await import("vite").then(({ createServer }) =>
    createServer({
      root: process.cwd() + "/frontend",
      define: {
        "process.env.SHOPIFY_API_KEY": JSON.stringify(
          process.env.SHOPIFY_API_KEY
        ),
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
          "^/api/.*": {
            target: "http://localhost:8081",
            changeOrigin: false,
            secure: true,
            ws: false,
          },
          "^/$": {
            target: "http://localhost:8081",
            changeOrigin: false,
            secure: true,
            ws: false,
          },
        },
      },
    })
  );

  app.use(vite.middlewares);

  return { app };
}

createServer().then(({ app }) => app.listen(PORT));
