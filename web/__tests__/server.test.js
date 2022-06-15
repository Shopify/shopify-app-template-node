import request from "supertest";
import { createHmac } from "crypto";
import { Shopify } from "@shopify/shopify-api";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { serve } from "./serve.js";

// Set up some module mocks, since the modules themselves are tested separately
const billingMock = vi.fn();
vi.mock(`${process.cwd()}/helpers/ensure-billing.js`, async () => {
  const actualModule = await vi.importActual(
    `${process.cwd()}/helpers/ensure-billing.js`
  );

  return {
    default: billingMock,
    BillingInterval: actualModule.BillingInterval,
  };
});
import { BillingInterval } from "../helpers/ensure-billing.js";

vi.mock(`${process.cwd()}/middleware/verify-request.js`, () => ({
  default: vi.fn(() => (req, res, next) => {
    next();
  }),
}));

describe("shopify-app-template-node server", async () => {
  const { app } = await serve(process.cwd(), false);

  test("loads html on /", async () => {
    const response = await request(app).get("/").set("Accept", "text/html");

    expect(response.status).toEqual(200);
  });

  test.concurrent(
    "properly handles nested routes in production mode",
    async () => {
      const { app: productionApp } = await serve(process.cwd(), true);

      const response = await request(productionApp)
        .get("/something")
        .set("Accept", "text/html");

      expect(response.status).toEqual(200);
    },
    20000
  );

  test("redirects to auth if the app needs to be [re]installed", async () => {
    const response = await request(app)
      .get("/?shop=test-shop")
      .set("Accept", "text/html");

    expect(response.status).toEqual(302);
    expect(response.headers.location).toEqual("/api/auth?shop=test-shop");
  });

  describe("content-security-policy", () => {
    test("sets Content Security Policy for embedded apps", async () => {
      Shopify.Context.IS_EMBEDDED_APP = true;

      const response = await request(app).get(
        "/?shop=test-shop.myshopify.test"
      );

      expect(response.headers["content-security-policy"]).toEqual(
        `frame-ancestors https://test-shop.myshopify.test https://admin.shopify.com;`
      );
    });

    test("sets header correctly when shop is missing", async () => {
      Shopify.Context.IS_EMBEDDED_APP = true;

      const response = await request(app).get("/");

      expect(response.headers["content-security-policy"]).toEqual(
        `frame-ancestors 'none';`
      );
    });

    test("sets header correctly when app is not embedded", async () => {
      Shopify.Context.IS_EMBEDDED_APP = false;

      const response = await request(app).get(
        "/?shop=test-shop.myshopify.test"
      );

      expect(response.headers["content-security-policy"]).toEqual(
        `frame-ancestors 'none';`
      );
    });
  });

  test("goes to top level auth in oauth flow when there is no cookie", async () => {
    const response = await request(app)
      .get("/api/auth")
      .set("Accept", "text/html");

    expect(response.status).toEqual(302);
    expect(response.headers.location).toContain(`/auth/toplevel`);
  });

  test("renders toplevel auth page", async () => {
    const response = await request(app)
      .get("/api/auth/toplevel?shop=test-shop")
      .set("Accept", "text/html");

    expect(response.status).toEqual(200);
    expect(response.text).toContain(`shopOrigin: 'test-shop'`);
  });

  test("goes through oauth flow if there is a top level cookie", async () => {
    // get a signed top level cookie from the headers
    const { headers } = await request(app).get("/api/auth/toplevel");

    const response = await request(app)
      .get("/api/auth")
      .set("Cookie", ...headers["set-cookie"]);

    expect(response.status).toEqual(302);
    expect(response.headers.location).toContain(`/admin/oauth/authorize`);
  });

  describe("handles the callback correctly", () => {
    test("redirects to / with the shop and host if nothing goes wrong", async () => {
      const validateAuthCallback = vi
        .spyOn(Shopify.Auth, "validateAuthCallback")
        .mockImplementationOnce(() => ({
          shop: "test-shop",
          scope: "write_products",
        }));
      vi.spyOn(Shopify.Webhooks.Registry, "register").mockImplementationOnce(
        () => ({
          APP_UNINSTALLED: {
            success: true,
          },
        })
      );

      billingMock.mockImplementation(() => Promise.resolve([true, null]));

      const response = await request(app).get(
        "/api/auth/callback?host=test-shop-host&shop=test-shop"
      );

      expect(validateAuthCallback).toHaveBeenLastCalledWith(
        expect.anything(),
        expect.anything(),
        {
          host: "test-shop-host",
          shop: "test-shop",
        }
      );
      expect(app.get("active-shopify-shops")).toEqual({
        "test-shop": "write_products",
      });
      expect(response.status).toEqual(302);
      expect(response.headers.location).toEqual(
        "/?shop=test-shop&host=test-shop-host"
      );
    });

    test("returns 400 if oauth is invalid", async () => {
      vi.spyOn(Shopify.Auth, "validateAuthCallback").mockImplementationOnce(
        () => {
          throw new Shopify.Errors.InvalidOAuthError("test 400 response");
        }
      );

      const response = await request(app).get(
        "/api/auth/callback?host=test-shop-host"
      );

      expect(response.status).toEqual(400);
      expect(response.text).toContain("test 400 response");
    });

    test("redirects to auth if cookie is not found", async () => {
      vi.spyOn(Shopify.Auth, "validateAuthCallback").mockImplementationOnce(
        () => {
          throw new Shopify.Errors.CookieNotFound("cookie not found");
        }
      );

      const response = await request(app).get(
        "/api/auth/callback?host=test-shop-host&shop=test-shop"
      );

      expect(response.status).toEqual(302);
      expect(response.headers.location).toEqual("/api/auth?shop=test-shop");
    });

    test("redirects to auth if session is not found", async () => {
      vi.spyOn(Shopify.Auth, "validateAuthCallback").mockImplementationOnce(
        () => {
          throw new Shopify.Errors.SessionNotFound("session not found");
        }
      );

      const response = await request(app).get(
        "/api/auth/callback?host=test-shop-host&shop=test-shop"
      );

      expect(response.status).toEqual(302);
      expect(response.headers.location).toEqual("/api/auth?shop=test-shop");
    });

    test("returns a 500 error otherwise", async () => {
      vi.spyOn(Shopify.Auth, "validateAuthCallback").mockImplementationOnce(
        () => {
          throw new Error("test 500 response");
        }
      );

      const response = await request(app).get(
        "/api/auth/callback?host=test-shop-host&shop=test-shop"
      );

      expect(response.status).toEqual(500);
      expect(response.text).toContain("test 500 response");
    });
  });

  describe("webhook processing", () => {
    const process = vi.spyOn(Shopify.Webhooks.Registry, "process");

    test("processes webhooks", async () => {
      Shopify.Webhooks.Registry.addHandler("TEST_HELLO", {
        path: "/api/webhooks",
        webhookHandler: () => {},
      });

      const response = await request(app)
        .post("/api/webhooks")
        .set(
          "X-Shopify-Hmac-Sha256",
          createHmac("sha256", Shopify.Context.API_SECRET_KEY)
            .update("{}", "utf8")
            .digest("base64")
        )
        .set("X-Shopify-Topic", "TEST_HELLO")
        .set("X-Shopify-Shop-Domain", "test-shop")
        .send("{}");

      expect(response.status).toEqual(200);
      expect(process).toHaveBeenCalledTimes(1);
    });

    test("returns a 500 error if webhooks do not process correctly", async () => {
      process.mockImplementationOnce(() => {
        throw new Error("test 500 response");
      });

      const response = await request(app).post("/api/webhooks");

      expect(response.status).toEqual(500);
      expect(response.text).toContain("test 500 response");
    });

    test("does not write to response if webhook processing has already output headers", async () => {
      const consoleSpy = vi.spyOn(console, "log");
      process.mockImplementationOnce((request, response) => {
        response.writeHead(400);
        response.end();
        throw new Error("something went wrong");
      });

      const response = await request(app).post("/api/webhooks");

      expect(response.status).toEqual(400);
      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy.mock.lastCall[0]).toContain("something went wrong");
    });
  });

  describe("graphql proxy", () => {
    const proxy = vi.spyOn(Shopify.Utils, "graphqlProxy");

    test("graphql proxy is called & responds with body", async () => {
      const body = {
        data: {
          test: "test",
        },
      };
      proxy.mockImplementationOnce(() => ({
        body,
      }));

      const response = await request(app).post("/api/graphql").send({
        query: "{hello}",
      });

      expect(proxy).toHaveBeenCalledTimes(1);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual(body);
    });

    test("returns a 500 error if graphql proxy fails", async () => {
      proxy.mockImplementationOnce(() => {
        throw new Error("test 500 response");
      });

      const response = await request(app).post("/api/graphql");

      expect(response.status).toEqual(500);
      expect(response.text).toContain("test 500 response");
    });
  });

  describe("with billing enabled", async () => {
    const { app: appWithBilling } = await serve(process.cwd(), false, {
      required: true,
      amount: 5.0,
      currencyCode: "USD",
      interval: BillingInterval.OneTime,
    });

    test("redirects to a payment confirmation URL", async () => {
      const validateAuthCallback = vi
        .spyOn(Shopify.Auth, "validateAuthCallback")
        .mockImplementationOnce(() => ({
          shop: "test-shop",
          scope: "write_products",
        }));
      vi.spyOn(Shopify.Webhooks.Registry, "registerAll").mockImplementationOnce(
        () => ({
          APP_UNINSTALLED: {
            success: true,
          },
        })
      );
      billingMock.mockImplementation(() =>
        Promise.resolve([false, "payment-confirmation-url"])
      );

      const response = await request(appWithBilling).get(
        "/api/auth/callback?host=test-shop-host&shop=test-shop"
      );

      expect(response.status).toEqual(302);
      expect(response.headers.location).toEqual("payment-confirmation-url");
    });
  });
});
