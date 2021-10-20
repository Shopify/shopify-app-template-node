# Removing Next.js from the backend stack

Previously, our app was using both Koa and Next.js in the backend, which made the server over-complicated and slower, and we decided to keep our Koa server which did most of the work.

The main difference between these stacks is that Next.js includes webpack which was used to build the React client, whereas koa doesn't. This guide will mainly consist of the changes you'll need to make to your app to add webpack to it.

1. [Remove the next packages](#remove-the-next-packages)
1. [Remove next references from the code](#remove-next-references-from-the-code)
1. [Add files required for webpack](#add-files-required-for-webpack)
1. [Add webpack middleware](#add-webpack-middleware)
1. [Update the React client](#update-the-react-client)
1. [Serve static files](#serve-static-files)

### Remove the `next` packages

The first step is to drop the packages from your `package.json` file:

```
npm remove next next-env
```

This will remove the built-in webpack support from Next.js, which we'll add back next. Then, you should update the `scripts` session in `package.json` to this:

```json
"scripts": {
  "test": "jest",
  "dev": "cross-env NODE_ENV=development nodemon ./server/index.js --watch ./server/index.js",
  "build": "webpack build",
  "start": "cross-env NODE_ENV=production node ./server/index.js"
},
```

### Remove `next` references from the code

You'll need to delete a few lines that reference Next.js in `server.js`:

```js
import next from "next";
...
const app = next({
  dev,
});
const handle = app.getRequestHandler();
```

The Next.js server is created inside of the `app.prepare().then(async () => {` call in `server.js`. You'll need to replace that with:

```js
async function createAppServer() {
  ... // Code within app.prepare().then(...) goes here
}

createAppServer();
```

You'll also need to change the fallback request handling, by replacing these bits of code:

```js
const handleRequest = async (ctx) => {
  await handle(ctx.req, ctx.res);
  ctx.respond = false;
  ctx.res.statusCode = 200;
};

...

router.get("(/_next/static/.*)", handleRequest); // Static content is clear
router.get("/_next/webpack-hmr", handleRequest); // Webpack content is clear
router.get("(.*)", async (ctx) => {
  const shop = ctx.query.shop;

  // This shop hasn't been seen yet, go through OAuth to create a session
  if (ACTIVE_SHOPIFY_SHOPS[shop] === undefined) {
    ctx.redirect(`/auth?shop=${shop}`);
  } else {
    await handleRequest(ctx);
  }
});
```

with:

```js
router.get("(.*)", async (ctx) => {
  const shop = ctx.query.shop;

  // This shop hasn't been seen yet, go through OAuth to create a session
  if (ACTIVE_SHOPIFY_SHOPS[shop] === undefined) {
    ctx.redirect(`/auth?shop=${shop}`);
  } else {
    ctx.response.type = "html";
    if (dev) {
      // We'll add this once we have webpack working
    } else {
      ctx.response.body = fs.readFileSync(
        path.resolve(__dirname, "../dist/index.html")
      );
    }
  }
});
```

At this point you should be able to run your server (`shopify node serve` or `npm run dev`) and your app will authenticate, but it won't properly load yet!

### Add files required for webpack

You'll need to copy these files from Github:

- [index.html](../../index.html) to your project root
- [webpack.config.js](../../webpack.config.js) to your project root
  - Please note that we've renamed the `pages` folder into `client` in this app. If you don't want to rename your folder, you should edit the `entry` value in your config, to:
  ```js
  entry: [path.join(__dirname, "pages", "index.js")],
  ```

### Add webpack middleware

To be able to run the React app in development mode, you'll need to add the `koa-webpack` package and use its middlewares.

```
npm install koa-webpack html-webpack-plugin@^4.0.0
```

You'll also need some babel packages / loaders to be able to compile everything:

```
npm install @babel/core@^7.13.0 babel-loader @babel/preset-env @babel/preset-react style-loader@^2.0.0 css-loader@^5.0.0 regenerator-runtime webpack-cli webpack-dev-server
```

Then, add this to your `server.js` file:

```js
import fs from "fs";
import path from "path";
import koaWebpack from "koa-webpack";

const webpackConfig = require("../webpack.config.js");

...

async function createAppServer() {
  const server = new Koa();
  const router = new Router();
  server.keys = [Shopify.Context.API_SECRET_KEY];

+  let middleware;
+  if (dev) {
+    middleware = await koaWebpack({
+      config: { ...webpackConfig, mode: process.env.NODE_ENV },
+    });
+    server.use(middleware);
+  }
```

and this to your `(*)` route:

```js
router.get("(.*)", async (ctx) => {
  const shop = ctx.query.shop;

  // This shop hasn't been seen yet, go through OAuth to create a session
  if (ACTIVE_SHOPIFY_SHOPS[shop] === undefined) {
    ctx.redirect(`/auth?shop=${shop}`);
  } else {
    ctx.response.type = "html";
    if (dev) {
+      ctx.response.body = middleware.devMiddleware.fileSystem.createReadStream(
+        path.resolve(webpackConfig.output.path, "index.html")
+      );
    } else {
      ctx.response.body = fs.readFileSync(
        path.resolve(__dirname, "../dist/index.html")
      );
    }
  }
});
```

### Update the React client

Next.js apps use some default configs to render the React client. Since we don't have that support any more, we'll need to change our client `index.js` file to render the app for us:

```jsx
- const Index = () => (
-   <Page>
-     <Heading>Shopify app with Node and React 🎉</Heading>
-   </Page>
- );

- export default Index;

+ import React from "react";
+ import ReactDOM from "react-dom";
+ import MyApp from "./_app";

+ ReactDOM.render(
+   <MyApp>
+     <Page>
+       <Heading>Shopify app with Node and React 🎉</Heading>
+     </Page>
+   </MyApp>,
+   document.getElementById("root")
+ );

```

Note that the `MyApp` component has changed. We recommend copying it from [Github](../../client/_app.js).

### Serve static files

The last step is to serve your app's static files, which will be used for. To do that, you'll need the `koa-static` package:

```
npm install koa-static
```

And add the following to your `server.js` file:

```js
import serveStatic from "koa-static";

...

+ if (!dev) {
+   server.use(serveStatic(path.resolve(__dirname, "../dist")));
+ }
router.get("(.*)", async (ctx) => {
```
