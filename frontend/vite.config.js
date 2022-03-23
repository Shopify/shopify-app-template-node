import react from "@vitejs/plugin-react";
import "dotenv/config";
import { defineConfig } from "vite";
// import fetch from "cross-fetch";
// import httpProxy from "http-proxy";

const config = defineConfig({
  define: {
    "process.env.SHOPIFY_API_KEY": JSON.stringify(process.env.SHOPIFY_API_KEY),
  },
  plugins: [react()],
  server: {
    hmr: {
      protocol: "ws",
      host: "localhost",
      port: 64999,
      clientPort: 64999,
    },
    host: "127.0.0.1",
    port: 3001,
    origin: "http://127.0.0.1:3001",
    cors: false,
  },
  // server: {
  //   proxy: {
  //     "": {
  //       target: "http://localhost:8081",
  //       changeOrigin: false,
  //       secure: true,
  //       configure: (proxy, options) => {
  //         proxy.on("proxyRes", function (proxyRes, req, res) {
  //           console.log(res.statusCode);
  //         });
  //       },
  //     },
  //   },
  // },
});

// var proxy = new httpProxy.createProxyServer({
//   target: `http://localhost:${process.env.BACKEND_PORT}`,
// });

// function BackendProxy() {
//   return {
//     name: "BackendProxy",
//     configureServer: (server) => {
//       server.middlewares.use(async (req, res, next) => {
//         // First attempt: write code to proxy the request
//         console.log(`Responding to ${request.url}`);
//         const url = new URL(
//           request.url,
//           `http://localhost:${process.env.BACKEND_PORT}`
//         );
//         // TODO What else do we need to foward here?
//         const backendResponse = await fetch(url.toString(), {
//           headers: request.headers,
//           redirect: "manual",
//         });
//         // User goes to /
//         // :3000 gets /
//         // :3000 goes to :8081/
//         // :8081/ returns 302 :8081/auth
//         // :3000 should return 302 /auth
//         // :8081/auth returns 302 /admin/oauth/authorize
//         if (backendResponse) {
//           backendResponse.headers.forEach((value, key) => {
//             if (key === "location") {
//               const redirectUrl = new URL(value);
//               if (redirectUrl.host === "localhost:8081") {
//                 value = `https://${process.env.HOST.replace(
//                   /^https:\/\//,
//                   ""
//                 )}${redirectUrl.pathname}${redirectUrl.search}`;
//               }
//             }
//             response.setHeader(key, value);
//           });
//           response.statusCode = backendResponse.status;
//           // if (backendResponse.body) {
//           //   response.write(backendResponse.body);
//           // }
//           response.end();
//           return;
//         }
//         next();

//         // Second attempt: use http-proxy (non-starter)
//         proxy.on("proxyRes", function (proxyRes, req2, res2) {
//           var body = [];
//           proxyRes.on("data", function (chunk) {
//             body.push(chunk);
//           });
//           proxyRes.on("end", function () {
//             body = Buffer.concat(body).toString();
//             console.log("res from proxied server:", body);
//             res.end("my response to cli");
//           });
//         });
//         proxy.web(req, res);
//       });
//     },
//   };
// }

export default config;
