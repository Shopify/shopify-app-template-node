import { Shopify } from "@shopify/shopify-api";
import express from "express";
import request from "supertest";
import { describe, expect, test, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";
import { serve } from "../../__tests__/serve";

import verifyRequest from "../verify-request.js";

const beginAuthMock = vi.fn().mockImplementation(async (_req, _res, _app) => {
  return Promise.resolve("mock/begin/auth/url");
});

vi.spyOn(Shopify.Auth, "beginAuth").mockImplementation(beginAuthMock);

describe("verify-request middleware", async () => {
  // this is only used to grab app wide constants
  const { app } = await serve(process.cwd(), false);

  const validJWT = jwt.sign(
    {
      dummy: "data",
      aud: Shopify.Context.API_KEY,
      dest: "https://test-shop",
    },
    Shopify.Context.API_SECRET_KEY,
    {
      algorithm: "HS256",
    }
  );

  beforeEach(() => {
    beginAuthMock.mockClear();
  });

  test("should return a function", () => {
    expect(verifyRequest(app, {})).toBeInstanceOf(Function);
  });

  describe("with a Session & authorization header", async () => {
    const mockApp = express();
    mockApp.use(verifyRequest(app));
    mockApp.get("/", (req, res) => {
      res.status(200).end();
    });

    test("active & valid session does not redirect to /auth", async () => {
      const session = new Shopify.Session.Session(
        "1",
        "test-shop",
        "state",
        app.get("use-online-tokens")
      );
      session.scope = Shopify.Context.SCOPES;
      session.accessToken = "access-token";
      session.expires = null;
      vi.spyOn(Shopify.Utils, "loadCurrentSession").mockImplementationOnce(
        () => session
      );
      vi.spyOn(Shopify.Clients, "Graphql").mockImplementationOnce(() => ({
        query: () => ({
          shop: {
            name: "test-shop",
          },
        }),
      }));

      const response = await request(mockApp).get("/?shop=test-shop").send({
        query: "{shop{name}}",
      });

      expect(response.status).toBe(200);
    });

    test("inactive session with authorization header returns 403 with the right headers", async () => {
      const session = new Shopify.Session.Session(
        "1",
        "test-shop",
        "state",
        app.get("use-online-tokens")
      );
      vi.spyOn(Shopify.Utils, "loadCurrentSession").mockImplementationOnce(
        () => session
      );

      const response = await request(mockApp)
        .get("/?shop=test-shop")
        .set({ Authorization: `Bearer ${validJWT}` })
        .send({
          query: "{shop{name}}",
        });

      expect(response.status).toBe(403);
      expect(
        response.headers["x-shopify-api-request-failure-reauthorize"]
      ).toBe("1");
      expect(
        response.headers["x-shopify-api-request-failure-reauthorize-url"]
      ).toBe(`/api/auth?shop=test-shop`);
    });
  });

  test("inactive session without authorization header redirects to /auth", async () => {
    const mockApp = express();
    mockApp.use(verifyRequest(app));
    mockApp.get("/", (_req, res) => {
      res.status(200).end();
    });
    const session = new Shopify.Session.Session(
      "1",
      "test-shop",
      "state",
      app.get("use-online-tokens")
    );
    vi.spyOn(Shopify.Utils, "loadCurrentSession").mockImplementationOnce(
      () => session
    );

    const response = await request(mockApp).get("/?shop=test-shop").send({
      query: "{shop{name}}",
    });

    expect(response.status).toBe(302);
  });

  test("redirects when the session and shop are mismatched", async () => {
    const session = new Shopify.Session.Session(
      "2",
      "test-shop2",
      "state",
      app.get("use-online-tokens")
    );
    vi.spyOn(Shopify.Utils, "loadCurrentSession").mockImplementationOnce(
      () => session
    );

    const mockApp = express();
    mockApp.use(verifyRequest(app));
    mockApp.get("/", (_req, res) => {
      res.status(200).end();
    });

    const response = await request(mockApp).get("/?shop=test-shop").send({
      query: "{shop{name}}",
    });

    expect(response.status).toBe(302);
    expect(response.headers.location).toEqual("mock/begin/auth/url");
    expect(Shopify.Auth.beginAuth).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      "test-shop",
      "/api/auth/callback",
      false
    );
  });
});
