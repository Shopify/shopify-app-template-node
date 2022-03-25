import express from "express";

import config, { PORT } from "./vite.config.js";

async function createServer() {
  const app = express();

  const vite = await import("vite").then(({ createServer }) => createServer());

  app.use(vite.middlewares);

  return { app };
}

createServer().then(({ app }) => app.listen(PORT));
