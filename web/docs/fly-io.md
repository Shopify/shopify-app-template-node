# Hosting and deploying to fly.io

## Create a fly.io account

1. Go to [fly.io](https://fly.io) and click on _Get Started_.
2. [Download and install](https://fly.io/docs/flyctl/installing/) the Fly CLI
3. From the command line, sign up for Fly: `flyctl auth signup`.  You can sign-up with an email address or with a GitHub account.
4. Fill in credit card information and click _Subscribe_.

## Build and deploy a container

1. Change in to the `web` directory: `cd web`.
2. Create an app using `flyctl launch`.  You can choose your own app name or press enter to let Fly pick an app name. Choose a region for deployment (it should default to the closest one to you). Choose _No_ for DB. Choose _No_ to deploy now.
3. Make the following changes to the `fly.toml` file.

    - In the `[env]` section, add the following environment variables (in a `"` delimited string):

        |Variable|Description/value|
        |-|-|
        |`BACKEND_PORT`|The port on which to run the app; set to the same value as the `EXPOSE` line in the `Dockerfile` (`Dockerfile` default value is `8081`.|
        |`HOST`|set to the URL of the new app; this can be constructed by taking the `app` variable at the very top of the `fly.toml` file, prepending it with `https://` and adding `.fly.dev` to the end, e.g, if `app` is `"fancy-cloud-1234"`, then `HOST` should be set to `https://fancy-cloud-1234.fly.dev`|
        |`SCOPES`|comma-separated scopes for your app; the default for the unmodified template is `write_products`|
        |`SHOPIFY_API_KEY`|API key for your app, from the Partners Dashboard|

    - In the `[[services]]` section, change the value of `internal_port` to match the `BACKEND_PORT` value.

    - Example:

      ```ini
      :
      :
      [env]
        BACKEND_PORT = "8081"
        HOST = "https://fancy-cloud-1234.fly.dev"
        SCOPES = "write_products"
        SHOPIFY_API_KEY = "ReplaceWithKEYFromPartnerDashboard"

      :
      :

      [[services]]
        internal_port = 8081
      :
      :
      ```

4. Set the API secret environment variable for your app:

    ```shell
    flyctl secrets set SHOPIFY_API_SECRET=ReplaceWithSECRETFromPartnerDashboard
    ```

5. Build and deploy the app - note that you'll need the `SHOPIFY_API_KEY` to pass to the command

    ```shell
    flyctl deploy --build-arg SHOPIFY_API_KEY=ReplaceWithKEYFromPartnerDashboard
    ```

## Update URLs in Partner Dashboard and test your app

1. In the Partner Dashboard, update the main URL for your app to the value of url from the [fly.io dashboard](https://fly.io/dashboard) and set a callback URL to the same url with `/api/auth/callback` appended to it.  Note: this is the same as the `HOST` environment variable set in the `fly.toml` file.
2. Open the deployed app by browsing to `https://fancy-cloud-1234.fly.dev/api/auth?shop=my-dev-shop-name.myshopify.com`

## Deploy a new version of the app

1. After updating your code with new features and fixes, rebuild and redeploy using:

    ```shell
    flyctl deploy --build-arg SHOPIFY_API_KEY=ReplaceWithKeyFromPartnerDashboard
    ```

## To scale to multiple regions

1. Add a new region using `flyctl regions add CODE`, where `CODE` is the three-letter code for the region.  To obtain a list of regions and code, run `flyctl platform regions`.
2. Scale to two instances - `flyctl scale count 2`
