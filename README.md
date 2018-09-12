This project was bootstrapped with [Create Shopify App](https://github.com/Shopify/webgen).

## Table of Contents

- [Folder Structure](#folder-structure)
- [Available Scripts](#available-scripts)
  - [yarn dev](#yarn-dev)
  - [yarn test](#yarn-test)
  - [yarn lint](#yarn-lint)
  - [yarn type-check](#yarn-type-check)
  - [yarn format](#yarn-format)
  - [yarn build](#yarn-build)
  - [yarn nuke](#yarn-nuke)
- [Editor](#editor)
- [Shopify App Authentication](#shopify-app-authentication)

## Folder Structure

After creation, your project should look like this:

```
├── README.md
├── package.json
├── sewing-kit-config.js
│
├── config
│   └── server.js
│
├── client
│   ├── index.ts (Entry to the app's client rendering)
│   └── render-app.tsx (Client rendering wrappers that render <App />)
│
├── server
│   ├── index.ts (Entry to the app's server rendering and all of the Koa setup)
│   └── render-app.tsx (Server rendering wrappers that render <App />, written as a Koa middleware)
│
└── app
    ├── components (Shared components in between sections)
    │
    ├── foundation (Base components for one-use app-concerned things)
    │   ├── App
    │   │   └── App.tsx (Sets up all the providers for the app)
    │   └── Routes
    │        └── Routes.tsx (The app's first-level routing file)
    │
    └── sections (Container views that compose presentation components into UI blocks; usually map closely to the first-level route in the app)
        │
        ├── Home
        │   └── HomeDetails
        │        └── HomeDetails.tsx (The app's default page)
        │
        └── {SectionName} (Future section)
            ├── {SectionName}Index
            │    └── {SectionName}Index.tsx
            │
            ├── {SectionName}Show
            │    └── {SectionName}Show.tsx
            │
            └── index.tsx (The app's nested routing file for this specific section)
```

To add more routes, create a similar folder structure as `sections/Home` in the `sections` folder. Then edit `app/foundation/Routes/Routes.tsx` to add the desired route.

## Available Scripts

All of the scripts listed below are based on `sewing-kit`'s commands.
Read more about the these commands [here](https://github.com/Shopify/sewing-kit/blob/master/docs/commands).

### `yarn dev`

Runs the app in the development mode.<br>
Open [http://localhost:8081](http://localhost:8081) to view it in the browser.

### `yarn test`

Runs Jest test in watch mode on changed tests

### `yarn lint`

Runs all of the app's linters against JavaScript, TypeScript, and SCSS. It also detects unformatted JavaScript, JSON, Markdown and GraphQL. Running the format command fixes the unformatted code.

### `yarn type-check`

Runs TypeScript type checking

### `yarn format`

Formats files using Prettier, ESLint, and Stylelint.

### `yarn build`

Builds production assets and saves them to the filesystem.

### `yarn nuke`

🔨 for problems that aren't fixed by restarting the development server. Clears out node_modules (recursively), sewing-kit's caches, build folders, and other metadata.

## Editor

It is recommended that you use [VS Code](https://code.visualstudio.com) as a text editor with this project.

`.vscode` contains the recommended editor settings and the extensions you should install for in-editor linting and prettier formatting setup.

## Shopify App Authentication

For general information on how to authenticate an Shopify app, follow the document here:
https://help.shopify.com/en/api/getting-started/authentication

For setting up your project, follow the steps below.

#### Step 1

To setup Shopify app authentication, copy and paste `.env.example` and rename it to `.env` (if the file doesn't exist already).

#### Step 2

Make sure that `.env` has the correct Shopify app credentials filled in for the variables `SHOPIFY_API_KEY` and `SHOPIFY_SECRET`.

If there is a development shop you like to use, update the value in `HOST_NAME`.

#### Step 3

Update `config/app.js` => `scopes` with the list of permissions this app needs using values from this document
https://help.shopify.com/en/api/getting-started/authentication/oauth/scopes

#### Step 4

Run `yarn` && `yarn dev` and view the page in a browser to install the app in your test shop.
