# Shopify App Node

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE.md)
[![Build Status](https://travis-ci.com/Shopify/shopify-app-node.svg?branch=master)](https://travis-ci.com/Shopify/shopify-app-node)

Boilerplate to create an embedded Shopify app made with Node, [Polaris](https://github.com/Shopify/polaris-react), and [App Bridge React](https://shopify.dev/tools/app-bridge/react-components).

## Installation

Using the [Shopify CLI](https://github.com/Shopify/shopify-cli) run:

```sh
shopify app create node -n APP_NAME
```

Or, you can run `npx degit shopify/shopify-app-node` and create a `.env` file containing the following values:

```
SHOPIFY_API_KEY={api key}           # Your API key
SHOPIFY_API_SECRET={api secret key} # Your API secret key
SCOPES={scopes}                     # Your app's required scopes, comma-separated
HOST={your app's host}              # Your app's host, without the protocol prefix
```

## What do I need to know about this app?

This is a sample app to help developers bootstrap their Shopify app development.

It leverages the [Shopify API Library](https://github.com/Shopify/shopify-node-api) package to create [an embedded app](https://shopify.dev/apps/tools/app-bridge/getting-started#embed-your-app-in-the-shopify-admin).

Here are some of the key features of this sample app:

1. The backend is a [Koa server](/server/server.js) that sets up the main functions you'll need to create an app

   - OAuth to create [access tokens](https://shopify.dev/apps/auth/oauth) for the app
   - Webhook subscription / processing, if needed
   - A GraphQL proxy endpoint that forwards queries from the frontend to the Shopify Admin API

1. The frontend is a client-side rendered React app

   - It uses Shopify App Bridge to create [session tokens](https://shopify.dev/apps/auth/session-tokens/how-session-tokens-work)
   - It is set up to make requests to the GraphQL API via an [Apollo client](/client/components/App.js) that hits the server proxy mentioned above
   - To add more pages to your app, we recommend using the [`react-router-dom`](https://www.npmjs.com/package/react-router-dom) package to create a client-side router

1. Because this app is embedded, the server can only verify requests that are made using the `authenticatedFetch` function from App Bridge
   - You will not be able to authenticate requests that are made by changing your browser's URL, since they won't carry the session token in the `Authorization` HTTP header
   - For more information, see [this tutorial on session tokens](https://shopify.dev/apps/auth/session-tokens/app-bridge-utilities)

## Requirements

- If you don’t have one, [create a Shopify partner account](https://partners.shopify.com/signup).
- If you don’t have one, [create a Development store](https://help.shopify.com/en/partners/dashboard/development-stores#create-a-development-store) where you can install and test your app.
- In the Partner dashboard, [create a new app](https://help.shopify.com/en/api/tools/partner-dashboard/your-apps#create-a-new-app). You’ll need this app’s API credentials during the setup process.

## Usage

This repository is used by [Shopify-App-CLI](https://github.com/Shopify/shopify-app-cli) as a scaffold for Node apps. You can clone or fork it yourself, but it’s faster and easier to use Shopify App CLI, which handles additional routine development tasks for you.

## Update history

### October 2021: Removing Next.js from the backend stack

Our sample app was previously using both Koa and Next.js, which made the server-side unnecessarily complex, so we decided to remove Next.js from the backend stack. Since Next.js was what included webpack in the project, we had to add webpack as a direct dependency so we could continue to build the client React app.

## License

This respository is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
