/* eslint-disable no-console */
import 'isomorphic-fetch';

import * as Koa from 'koa';
import * as session from 'koa-session';
import shopifyAuth, {verifyRequest} from '@shopify/koa-shopify-auth';
import graphQLProxy from '@shopify/koa-shopify-graphql-proxy';
import {pathExistsSync, readFileSync} from 'fs-extra';
import httpProxy from 'http-proxy';

import {ip, port, tunnelFile} from '../config/server';
import config from '../config/app';
import renderApp from './render-app';

process.on('unhandledRejection', (error) => console.log(error));

const {apiKey, secret, scopes, hostName} = config;
const app = new Koa();
app.keys = [secret];

app.use(session(app));

app.use(
  shopifyAuth({
    apiKey,
    secret,
    scopes,
    afterAuth(ctx) {
      ctx.redirect('/');
    },
  }),
);

const proxy = httpProxy.createProxyServer();

app.use((ctx, next) => {
  if (/^\/webpack\//.test(ctx.path)) {
    ctx.respond = false;
    return proxy.web(ctx.req, ctx.res, {target: 'http://localhost:8080'});
  } else {
    return next();
  }
});

const fallbackRoute = hostName === '' ? undefined : `/auth?shop=${hostName}`;
app.use(
  verifyRequest({
    fallbackRoute,
  }),
);

app.use(graphQLProxy());

app.use(renderApp);

let server;
if (process.env.NODE_ENV === 'development') {
  server = app.listen(port, () => {
    console.log(`[init] listening on ${ip}:${port}`);
    if (pathExistsSync(tunnelFile)) {
      const url = readFileSync(tunnelFile).toString();
      console.log(`App accessible via ${url}`);
    } else {
      console.log('Run `yarn tunnel` in another terminal to use your access your app from a development shop.');
    }
  });
} else {
  server = app.listen(port, () => {
    console.log(`[init] listening on ${ip}:${port}`);
  });
}

server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head, {target: 'http://localhost:8080'});
});

export default app;
