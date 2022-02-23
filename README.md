# Shopify App Node

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE.md)
[![Build Status](https://travis-ci.com/Shopify/shopify-app-node.svg?branch=master)](https://travis-ci.com/Shopify/shopify-app-node)

This is a sample app to help developers bootstrap their Shopify app development.

It leverages the [Shopify API Library](https://github.com/Shopify/shopify-node-api) on the backend to create [an embedded app](https://shopify.dev/apps/tools/app-bridge/getting-started#embed-your-app-in-the-shopify-admin), and [Polaris](https://github.com/Shopify/polaris-react) and [App Bridge React](https://shopify.dev/tools/app-bridge/react-components) on the frontend.

This is the repository used when you create a new Node app with the [Shopify CLI](https://shopify.dev/apps/tools/cli).

Recommended NodeJS version: v16

## Requirements

- If you don’t have one, [create a Shopify partner account](https://partners.shopify.com/signup).
- If you don’t have one, [create a Development store](https://help.shopify.com/en/partners/dashboard/development-stores#create-a-development-store) where you can install and test your app.
- **If you are not using the Shopify CLI**, in the Partner dashboard, [create a new app](https://help.shopify.com/en/api/tools/partner-dashboard/your-apps#create-a-new-app). You’ll need this app’s API credentials during the setup process.

## App architecture

Here are some of this app's main features:

1. The backend is a [Koa server](/server/server.js) that sets up the main functions you'll need to create an app:

   - OAuth to create [access tokens](https://shopify.dev/apps/auth/oauth) for the app
   - Webhook subscription / processing
   - A GraphQL proxy endpoint that forwards queries from the frontend to the Shopify Admin API. You can also use the GraphQL/REST clients provided by the library to make requests directly from the server

1. The frontend is a client-side rendered React app:

   - It uses Shopify App Bridge to create [session tokens](https://shopify.dev/apps/auth/session-tokens/how-session-tokens-work)
   - It makes requests to the GraphQL API via an [Apollo client](/client/components/App.js) that hits the server proxy mentioned above
   - To add more pages to your app, we recommend using the [`react-router-dom`](https://www.npmjs.com/package/react-router-dom) package to create a client-side router

1. Because this is an embedded app, the server can only verify requests made using the `authenticatedFetch` function from App Bridge:

   - You will not be able to authenticate requests made by changing your browser's URL (e.g. by clicking a regular link), since they won't carry the session token in the `Authorization` HTTP header
   - For more information, see [this tutorial on session tokens](https://shopify.dev/apps/auth/session-tokens/app-bridge-utilities)

## Installation

Using the [Shopify CLI](https://github.com/Shopify/shopify-cli) run:

```sh
shopify app create node -n APP_NAME
```

Or, you can run `npx degit shopify/shopify-app-node` and create a `.env` file containing the following values:

=======

It leverages the [Shopify API Library](https://github.com/Shopify/shopify-node-api) on the backend to create [an embedded app](https://shopify.dev/apps/tools/app-bridge/getting-started#embed-your-app-in-the-shopify-admin), and [Polaris](https://github.com/Shopify/polaris-react) and [App Bridge React](https://shopify.dev/tools/app-bridge/react-components) on the frontend.

This is the repository used when you create a new Node app with the [Shopify CLI](https://shopify.dev/apps/tools/cli).

## Requirements

- If you don’t have one, [create a Shopify partner account](https://partners.shopify.com/signup).
- If you don’t have one, [create a Development store](https://help.shopify.com/en/partners/dashboard/development-stores#create-a-development-store) where you can install and test your app.
- **If you are not using the Shopify CLI**, in the Partner dashboard, [create a new app](https://help.shopify.com/en/api/tools/partner-dashboard/your-apps#create-a-new-app). You’ll need this app’s API credentials during the setup process.

## App architecture

Here are some of this app's main features:

1. The backend is a [Koa server](/server/server.js) that sets up the main functions you'll need to create an app:

   - OAuth to create [access tokens](https://shopify.dev/apps/auth/oauth) for the app
   - Webhook subscription / processing
   - A GraphQL proxy endpoint that forwards queries from the frontend to the Shopify Admin API. You can also use the GraphQL/REST clients provided by the library to make requests directly from the server

1. The frontend is a client-side rendered React app:

   - It uses Shopify App Bridge to create [session tokens](https://shopify.dev/apps/auth/session-tokens/how-session-tokens-work)
   - It makes requests to the GraphQL API via an [Apollo client](/client/components/App.js) that hits the server proxy mentioned above
   - To add more pages to your app, we recommend using the [`react-router-dom`](https://www.npmjs.com/package/react-router-dom) package to create a client-side router

1. Because this is an embedded app, the server can only verify requests made using the `authenticatedFetch` function from App Bridge:

   - You will not be able to authenticate requests made by changing your browser's URL (e.g. by clicking a regular link), since they won't carry the session token in the `Authorization` HTTP header
   - For more information, see [this tutorial on session tokens](https://shopify.dev/apps/auth/session-tokens/app-bridge-utilities)

## Installation

Using the [Shopify CLI](https://github.com/Shopify/shopify-cli) run:

```sh
shopify app create node -n APP_NAME
```

Or, you can run `npx degit shopify/shopify-app-node` and create a `.env` file containing the following values:

```yaml
SHOPIFY_API_KEY={api key}           # Your API key
SHOPIFY_API_SECRET={api secret key} # Your API secret key
SCOPES={scopes}                     # Your app's required scopes, comma-separated
HOST={your app's host}              # Your app's host, without the protocol prefix
```

## Developer resources

- [Introduction to Shopify apps](https://shopify.dev/apps/getting-started)
  - [App authentication](https://shopify.dev/apps/auth)
- [Shopify CLI command reference](https://shopify.dev/apps/tools/cli/app)
- [Shopify API Library documentation](https://github.com/Shopify/shopify-node-api/tree/main/docs)

## Update history

### January 2022: Remove Next.js and Replace Koa with Express.js

We are now using the [Express](https://expressjs.com/) framework to keep Shopify's framework usage consistent.

Our sample app previously used both Koa and Next.js, which made the server-side unnecessarily complex. Initally we removed Next.js so Koa was our only framework, but now we are replacing Koa with Express. Since Next.js was what included webpack in the project, we had to add webpack as a direct dependency so we could continue to build the client React app.

## License

This respository is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
