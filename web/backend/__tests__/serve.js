import path from "path";

const port = 9528;

/**
 * @param {string} root
 * @param {boolean} isProd
 */
export async function serve(root, isProd) {
  if (isProd) {
    // build first
    const { build } = await import("vite");
    await build({
      root: path.join(root, "frontend"),
      logLevel: "silent",
      build: {
        target: "esnext",
        minify: false,
        ssrManifest: true,
        outDir: "../dist",
      },
    });
  }

  const { createServer } = await import(
    path.resolve(root, "backend", "index.js")
  );
  process.env.PORT = port;
  return await createServer(root, isProd);
}
