// @ts-check
// this is automtically detected by scripts/jestPerTestSetup.ts and will replace
// the default e2e test serve behavior

import path from 'path';

export const port = 9528;

/**
 * @param {string} root
 * @param {boolean} isProd
 */
export async function serve(root, isProd) {
  if (isProd) {
    // build first
    const {build} = await import('vite');
    // client build
    await build({
      root,
      logLevel: 'silent', // exceptions are logged by Jest
      build: {
        target: 'esnext',
        minify: false,
        ssrManifest: true,
        outDir: 'dist/client',
      },
    });
  }

  const {createServer} = await import(path.resolve(root, 'server', 'index.js'));
  return await createServer(root, isProd);
}
