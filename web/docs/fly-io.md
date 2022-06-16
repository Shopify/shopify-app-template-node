# Hosting and deploying to fly.io

## Create a fly.io account

1. Go to [fly.io](https://fly.io) and click on _Get Started_.
1. [Download and install](https://fly.io/docs/flyctl/installing/) the Fly CLI
1. From the command line, sign up for Fly: `flyctl auth signup`.  You can sign up with an email address or with a GitHub account.
1. Fill in credit card information and click _Subscribe_.

## Build and deploy a container

1. Create an app using `flyctl launch`.  You can choose your own app name or press enter to let Fly pick an app name. Choose a region for deployment (it should default to the closest one to you). Choose _No_ for DB. Choose _No_ to deploy now.
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

1. Make the following changes to the `fly.toml` file.

    - In the `[env]` section, add the following environment variables (in a `"` delimited string):

        |Variable|Description/value|
        |-|-|
        |`BACKEND_PORT`|The port on which to run the app; set to the same value as the `EXPOSE` line in the `Dockerfile` (`Dockerfile` default value is `8081`.|
        |`HOST`|Set this to the URL of the new app, which can be constructed by taking the `app` variable at the very top of the `fly.toml` file, prepending it with `https://` and adding `.fly.dev` to the end, e.g, if `app` is `"fancy-cloud-1234"`, then `HOST` should be set to `https://fancy-cloud-1234.fly.dev`|
        |`SCOPES`|Can be obtained from the `run info --web-env` command in the previous step|
        |`SHOPIFY_API_KEY`|Can be obtained from the `run info --web-env` command in the previous step|

    - In the `[[services]]` section, change the value of `internal_port` to match the `BACKEND_PORT` value.

    - Example:

      ```ini
      :
      :
      [env]
        BACKEND_PORT = "8081"
        HOST = "https://fancy-cloud-1234.fly.dev"
        SCOPES = "write_products"
        SHOPIFY_API_KEY = "ReplaceWithKEYFromEnvCommand"

      :
      :

      [[services]]
        internal_port = 8081
      :
      :
      ```

1. Set the API secret environment variable for your app:

    ```shell
    flyctl secrets set SHOPIFY_API_SECRET=ReplaceWithSECRETFromEnvCommand
    ```

1. Build and deploy the app - note that you'll need the `SHOPIFY_API_KEY` to pass to the command

    ```shell
    flyctl deploy --build-arg SHOPIFY_API_KEY=ReplaceWithKEYFromEnvCommand --remote-only
    ```

## Update URLs in Partner Dashboard and test your app

1. Update main and callback URLs in Partner Dashboard to point to new app.  The main app URL should point to

    ```text
    https://my-app-name.fly.dev
    ```

    and the callback URL should be

    ```text
    https://my-app-name.fly.dev/api/auth/callback
    ```

1. Test the deployed app by browsing to

   ```text
   https://my-app-name.fly.dev/api/auth?shop=my-dev-shop-name.myshopify.com
   ```

## Deploy a new version of the app

1. After updating your code with new features and fixes, rebuild and redeploy using:

    ```shell
    flyctl deploy --build-arg SHOPIFY_API_KEY=ReplaceWithKEYFromEnvCommand --remote-only
    ```

## To scale to multiple regions

1. Add a new region using `flyctl regions add CODE`, where `CODE` is the three-letter code for the region.  To obtain a list of regions and code, run `flyctl platform regions`.
1. Scale to two instances - `flyctl scale count 2`
