# Hosting and deploying to Heroku

> Note: this deployment to Heroku relies on `git` so your app will need to be committed to a `git` repository. If you haven't done so yet, run the following commands to initialize and commit your source code to a `git` repository:

```shell
# be at the top-level of your app directory
git init
git add .
git commit -m "Initial version"
```

## Create and login to a Heroku account

1. Go to [heroku.com](https://heroku.com) and click on _Sign up_
1. [Download and install](https://devcenter.heroku.com/articles/heroku-cli#install-the-heroku-cli) the Heroku CLI
1. Login to the Heroku CLI using `heroku login`

## Build and deploy from Git to a Docker container

1. Login to Heroku Container Registry: `heroku container:login`
1. Create an app in Heroku using `heroku create -a my-app-name -s container`. This will configure Heroku with a container-based app and create a git remote named `heroku` for deploying the app. It will also return the URL to where the app will run when deployed, in the form of:

   ```text
   https://my-app-name.herokuapp.com
   ```

1. To create a new app in the Partner Dashboard or to link the app to an existing app, run the following command using your preferred package manager:

   Using yarn:

   ```shell
   yarn run info --web-env
   ```

   Using npm:

   ```shell
   npm run info --web-env
   ```

   Using pnpm:

   ```shell
   pnpm run info --web-env
   ```

   Take note of the `SCOPES`, `SHOPIFY_API_KEY` and the `SHOPIFY_API_SECRET` values, as you'll need them in the next steps.

1. Configure the environment variables `HOST`, `SCOPES`, `SHOPIFY_API_KEY`, and `SHOPIFY_API_SECRET` for your app. For example:

   ```shell
   heroku config:set HOST=https://my-app-name.herokuapp.com
   heroku config:set SCOPES=write_products
   heroku config:set SHOPIFY_API_KEY=ReplaceWithKEYFromEnvCommand
   heroku config:set SHOPIFY_API_SECRET=ReplaceWithSECRETFromEnvCommand
   ```

   Note that these commands can be combined into a single command:

   ```shell
   heroku config:set HOST=... SCOPES=... SHOPIFY_API_KEY=... SHOPIFY_API_SECRET=...
   ```

1. At the top-level directory of your app's source code, create a `heroku.yml` file with the following content:

   ```yaml
   build:
     docker:
       web: Dockerfile
     config:
       SHOPIFY_API_KEY: ReplaceWithKEYFromEnvCommand
   ```

   Commit the `heroku.yml` file to your git repository:

   ```shell
   git add heroku.yml
   git commit -m "Add Heroku manifest"
   ```

1. Push the app to Heroku. This will automatically build the `docker` image and deploy the app.

   ```shell
   git push heroku main
   ```

## Update URLs in Partner Dashboard and test your app

1. Update main and callback URLs in Partner Dashboard to point to new app. The main app URL should point to

   ```text
   https://my-app-name.herokuapp.com
   ```

   and the callback URL should be

   ```text
   https://my-app-name.herokuapp.com/api/auth/callback
   ```

1. Test the deployed app by browsing to

   ```text
   https://my-app-name.herokuapp.com/api/auth?shop=my-dev-shop-name.myshopify.com
   ```

## Deploy a new version of the app

1. Update code and commit to git. If updates were made on a branch, merge branch with `main`
1. Push `main` to Heroku: `git push heroku main` - this will automatically deploy the new version of your app.

> Heroku's dynos should restart automatically after setting the environment variables or pushing a new update from git. If you need to restart the dynos manually, use `heroku ps:restart`.
