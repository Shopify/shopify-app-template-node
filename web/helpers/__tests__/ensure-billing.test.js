import { Shopify } from "@shopify/shopify-api";
import { describe, expect, test, vi } from "vitest";

import ensureBilling, {
  BillingInterval,
  SHOPIFY_CHARGE_NAME,
} from "../ensure-billing";

describe("ensureBilling", async () => {
  const session = new Shopify.Session.Session("1", "test-shop", "state", true);
  session.scope = Shopify.Context.SCOPES;
  session.accessToken = "access-token";
  session.expires = null;

  describe("with no payments", async () => {
    test("requests a single payment if non-recurring", async () => {
      const spy = mockGraphQLQueries([
        EMPTY_SUBSCRIPTIONS,
        PURCHASE_ONE_TIME_RESPONSE,
      ]);

      const [hasPayment, confirmationUrl] = await ensureBilling(session, {
        amount: 5.0,
        interval: BillingInterval.OneTime,
      });

      expect(hasPayment).toBe(false);
      expect(confirmationUrl).toBe("totally-real-url");

      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          data: expect.objectContaining({
            query: expect.stringContaining("oneTimePurchases"),
          }),
        })
      );
      expect(spy).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          data: expect.objectContaining({
            query: expect.stringContaining("appPurchaseOneTimeCreate"),
          }),
        })
      );
    });

    test("requests a subscription if recurring", async () => {
      const spy = mockGraphQLQueries([
        EMPTY_SUBSCRIPTIONS,
        PURCHASE_SUBSCRIPTION_RESPONSE,
      ]);

      const [hasPayment, confirmationUrl] = await ensureBilling(session, {
        amount: 5.0,
        interval: BillingInterval.Every30Days,
      });

      expect(hasPayment).toBe(false);
      expect(confirmationUrl).toBe("totally-real-url");

      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          data: expect.stringContaining("activeSubscriptions"),
        })
      );
      expect(spy).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          data: expect.objectContaining({
            query: expect.stringContaining("appSubscriptionCreate"),
          }),
        })
      );
    });
  });

  describe("with payments", async () => {
    test("does not request subscription if non-recurring", async () => {
      const spy = mockGraphQLQueries([EXISTING_ONE_TIME_PAYMENT]);

      const [hasPayment, confirmationUrl] = await ensureBilling(session, {
        amount: 5.0,
        interval: BillingInterval.OneTime,
      });

      expect(hasPayment).toBe(true);
      expect(confirmationUrl).toBeNull();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          data: expect.objectContaining({
            query: expect.stringContaining("oneTimePurchases"),
          }),
        })
      );
    });

    test("ignores non-active one-time payments", async () => {
      const spy = mockGraphQLQueries([
        EXISTING_INACTIVE_ONE_TIME_PAYMENT,
        PURCHASE_ONE_TIME_RESPONSE,
      ]);

      const [hasPayment, confirmationUrl] = await ensureBilling(session, {
        amount: 5.0,
        interval: BillingInterval.OneTime,
      });

      expect(hasPayment).toBe(false);
      expect(confirmationUrl).toBe("totally-real-url");

      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          data: expect.objectContaining({
            query: expect.stringContaining("oneTimePurchases"),
          }),
        })
      );
      expect(spy).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          data: expect.objectContaining({
            query: expect.stringContaining("appPurchaseOneTimeCreate"),
          }),
        })
      );
    });

    test("paginates until a payment is found", async () => {
      const spy = mockGraphQLQueries(EXISTING_ONE_TIME_PAYMENT_WITH_PAGINATION);

      const [hasPayment, confirmationUrl] = await ensureBilling(session, {
        amount: 5.0,
        interval: BillingInterval.OneTime,
      });

      expect(hasPayment).toBe(true);
      expect(confirmationUrl).toBeNull();

      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          data: expect.objectContaining({
            query: expect.stringContaining("oneTimePurchases"),
            variables: expect.objectContaining({ endCursor: null }),
          }),
        })
      );
      expect(spy).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          data: expect.objectContaining({
            query: expect.stringContaining("oneTimePurchases"),
            variables: expect.objectContaining({ endCursor: "end_cursor" }),
          }),
        })
      );
    });

    test("does not request subscription if recurring", async () => {
      const spy = mockGraphQLQueries([EXISTING_SUBSCRIPTION]);

      const [hasPayment, confirmationUrl] = await ensureBilling(session, {
        amount: 5.0,
        interval: BillingInterval.Annual,
      });

      expect(hasPayment).toBe(true);
      expect(confirmationUrl).toBeNull();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          data: expect.stringContaining("activeSubscriptions"),
        })
      );
    });
  });
});

function mockGraphQLQueries(queryResponses) {
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

const EMPTY_SUBSCRIPTIONS = {
  body: {
    data: {
      currentAppInstallation: {
        oneTimePurchases: {
          edges: [],
          pageInfo: { hasNextPage: false, endCursor: null },
        },
        activeSubscriptions: [],
        userErrors: [],
      },
    },
  },
};

const EXISTING_ONE_TIME_PAYMENT = {
  body: {
    data: {
      currentAppInstallation: {
        oneTimePurchases: {
          edges: [
            {
              node: { name: SHOPIFY_CHARGE_NAME, test: true, status: "ACTIVE" },
            },
          ],
          pageInfo: { hasNextPage: false, endCursor: null },
        },
        activeSubscriptions: [],
      },
    },
  },
};

const EXISTING_ONE_TIME_PAYMENT_WITH_PAGINATION = [
  {
    body: {
      data: {
        currentAppInstallation: {
          oneTimePurchases: {
            edges: [
              {
                node: { name: "some_other_name", test: true, status: "ACTIVE" },
              },
            ],
            pageInfo: { hasNextPage: true, endCursor: "end_cursor" },
          },
          activeSubscriptions: [],
        },
      },
    },
  },
  {
    body: {
      data: {
        currentAppInstallation: {
          oneTimePurchases: {
            edges: [
              {
                node: {
                  name: SHOPIFY_CHARGE_NAME,
                  test: true,
                  status: "ACTIVE",
                },
              },
            ],
            pageInfo: { hasNextPage: false, endCursor: null },
          },
          activeSubscriptions: [],
        },
      },
    },
  },
];

const EXISTING_INACTIVE_ONE_TIME_PAYMENT = {
  body: {
    data: {
      currentAppInstallation: {
        oneTimePurchases: {
          edges: [
            {
              node: {
                name: SHOPIFY_CHARGE_NAME,
                test: true,
                status: "PENDING",
              },
            },
          ],
          pageInfo: { hasNextPage: false, endCursor: null },
        },
        activeSubscriptions: [],
      },
    },
  },
};

const EXISTING_SUBSCRIPTION = {
  body: {
    data: {
      currentAppInstallation: {
        oneTimePurchases: {
          edges: [],
          pageInfo: { hasNextPage: false, endCursor: null },
        },
        activeSubscriptions: [{ name: SHOPIFY_CHARGE_NAME, test: true }],
      },
    },
  },
};

const PURCHASE_ONE_TIME_RESPONSE = {
  body: {
    data: {
      appPurchaseOneTimeCreate: {
        confirmationUrl: "totally-real-url",
        userErrors: [],
      },
    },
  },
};

const PURCHASE_SUBSCRIPTION_RESPONSE = {
  body: {
    data: {
      appSubscriptionCreate: {
        confirmationUrl: "totally-real-url",
        userErrors: [],
      },
    },
  },
};
