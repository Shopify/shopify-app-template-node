import { Shopify } from "@shopify/shopify-api";
import { describe, expect, test, vi } from "vitest";

import productCreator, { DEFAULT_PRODUCTS_COUNT } from "../product-creator";


describe("productCreator", async () => {
  const session = new Shopify.Session.Session("1", "test-shop", "state", false);
  session.scope = Shopify.Context.SCOPES;
  session.accessToken = "access-token";
  session.expires = null;

  describe("defaults", async () => {
    test(`successfully creates ${DEFAULT_PRODUCTS_COUNT} products`, async () => {
      const spy = mockGraphQLMutations(
        [...Array(DEFAULT_PRODUCTS_COUNT).keys()].map(() => {
          return generateProductCreateSuccessResponse();
        }
      ));
      await productCreator(session);

      expect(spy).toHaveBeenCalledTimes(DEFAULT_PRODUCTS_COUNT);
      for (let i = 0; i < DEFAULT_PRODUCTS_COUNT; i++) {
        expect(spy).toHaveBeenNthCalledWith(
          i+1,
          expect.objectContaining({
            data: expect.objectContaining({
              query: expect.stringContaining("mutation populateProduct"),
            }),
          })
        );
      }
    });

    test(`fails to create ${DEFAULT_PRODUCTS_COUNT} products`, async () => {
      const spy = mockGraphQLMutations([
        PRODUCT_CREATE_ERROR_RESPONSE,
        PRODUCT_CREATE_ERROR_RESPONSE,
        PRODUCT_CREATE_ERROR_RESPONSE,
        PRODUCT_CREATE_ERROR_RESPONSE,
        PRODUCT_CREATE_ERROR_RESPONSE,
      ]);
      await productCreator(session);

      expect(spy).toHaveBeenCalledTimes(DEFAULT_PRODUCTS_COUNT);
      for (let i = 0; i < DEFAULT_PRODUCTS_COUNT; i++) {
        expect(spy).toHaveBeenNthCalledWith(
          i+1,
          expect.objectContaining({
            data: expect.objectContaining({
              query: expect.stringContaining("mutation populateProduct"),
            }),
          })
        );
      }
    });
  });

  describe("count = 2", async () => {
    const count = 2;

    test(`successfully creates ${count} products`, async () => {
      const spy = mockGraphQLMutations(
        [...Array(count).keys()].map(() => {
          return generateProductCreateSuccessResponse();
        }
      ));
      await productCreator(session, count);

      expect(spy).toHaveBeenCalledTimes(count);
      for (let i = 0; i < count; i++) {
        expect(spy).toHaveBeenNthCalledWith(
          i+1,
          expect.objectContaining({
            data: expect.objectContaining({
              query: expect.stringContaining("mutation populateProduct"),
            }),
          })
        );
      }
    });

    test(`fails to create ${count} products`, async () => {
      const spy = mockGraphQLMutations([
        PRODUCT_CREATE_ERROR_RESPONSE,
        PRODUCT_CREATE_ERROR_RESPONSE,
      ]);
      await productCreator(session, count);

      expect(spy).toHaveBeenCalledTimes(count);
      for (let i = 0; i < count; i++) {
        expect(spy).toHaveBeenNthCalledWith(
          i+1,
          expect.objectContaining({
            data: expect.objectContaining({
              query: expect.stringContaining("mutation populateProduct"),
            }),
          })
        );
      }
    });
  });
});

function mockGraphQLMutations(queryResponses) {
  let queryIndex = 0;
  const querySpy = vi.fn().mockImplementation(() => {
    return queryResponses[queryIndex++];
  });

  vi.spyOn(Shopify.Clients, "Graphql").mockImplementation(() => {
    return {
      query: querySpy,
    };
  });

  return querySpy;
}

function generateProductCreateSuccessResponse() {
  const gid = [...Array(13).keys()].map(() => { return Math.floor(Math.random() * 10) }).join("");
  let response = PRODUCT_CREATE_SUCCESS_RESPONSE;
  response.body.data.productCreate.product.id = `gid://shopify/Product/${gid}`;
  return response;
}

const PRODUCT_CREATE_SUCCESS_RESPONSE = {
  body: {
    data: {
      productCreate: {
        product: {
          id: "gid://shopify/Product/7422520950945"
        }
      }
    },
    extensions: {
      cost: {
        requestedQueryCost: 10,
        actualQueryCost: 10,
        throttleStatus: {
          maximumAvailable: 1000,
          currentlyAvailable: 990,
          restoreRate: 50
        }
      }
    }
  }
}

const PRODUCT_CREATE_ERROR_RESPONSE = {
  body: {
    data: {
      productCreate: null
    },
    errors: [
      {
        message: "Access denied for productCreate field. Required access: `write_products` access scope.",
        locations: [
          {
            line: 2,
            column: 3
          }
        ],
        path: [
          "productCreate"
        ],
        extensions: {
          code: "ACCESS_DENIED",
          documentation: "https://shopify.dev/api/usage/access-scopes",
          requiredAccess: "`write_products` access scope."
        }
      }
    ],
    extensions: {
      cost: {
        requestedQueryCost: 10,
        actualQueryCost: 10,
        throttleStatus: {
          maximumAvailable: 1000,
          currentlyAvailable: 990,
          restoreRate: 50
        }
      }
    }
  }
}
