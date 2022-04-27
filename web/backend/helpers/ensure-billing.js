import { Shopify } from "@shopify/shopify-api";

import returnTopLevelRedirection from "./return-top-level-redirection.js";

// The charge name is checked for recurring subscriptions, in case there are multiple
export const SHOPIFY_CHARGE_NAME = "Shopify app billing";

export const BillingInterval = {
  OneTime: "ONE_TIME",
  Every30Days: "EVERY_30_DAYS",
  Annual: "ANNUAL",
};

const RECURRING_INTERVALS = [
  BillingInterval.Every30Days,
  BillingInterval.Annual,
];

let isProd;

export default async function ensureBilling(
  session,
  { amount, currencyCode, interval },
  isProdOverride = process.env.NODE_ENV === "production"
) {
  if (!Object.values(BillingInterval).includes(interval)) {
    throw `Unrecognized billing interval '${interval}'`;
  }

  isProd = isProdOverride;

  let hasPayment;
  let confirmationUrl = null;

  if (await hasActivePayment(session, { interval })) {
    hasPayment = true;
  } else {
    hasPayment = false;
    confirmationUrl = await requestPayment(session, {
      amount,
      currencyCode,
      interval,
    });
  }

  return [hasPayment, confirmationUrl];
}

async function hasActivePayment(session, { interval }) {
  const client = new Shopify.Clients.Graphql(session.shop, session.accessToken);

  let hasPayment = false;
  if (isRecurring(interval)) {
    const currentInstallations = await client.query({
      data: `
        query appSubscription {
          currentAppInstallation {
            activeSubscriptions {
              name, test
            }
          }
        }
      `,
    });
    const subscriptions =
      currentInstallations.body.data.currentAppInstallation.activeSubscriptions;

    for (let i = 0, len = subscriptions.length; i < len; i++) {
      if (
        subscriptions[i].name === SHOPIFY_CHARGE_NAME &&
        (!isProd || !subscriptions[i].test)
      ) {
        hasPayment = true;
        break;
      }
    }
  } else {
    let purchases;
    let endCursor = null;
    do {
      const currentInstallations = await client.query({
        data: {
          query: `
            query appPurchases($endCursor: String) {
              currentAppInstallation {
                oneTimePurchases(first: 250, sortKey: CREATED_AT, after: $endCursor) {
                  edges {
                    node {
                      name, test, status
                    }
                  }
                  pageInfo {
                    hasNextPage, endCursor
                  }
                }
              }
            }
          `,
          variables: {
            endCursor,
          },
        },
      });
      purchases =
        currentInstallations.body.data.currentAppInstallation.oneTimePurchases;

      for (let i = 0, len = purchases.edges.length; i < len; i++) {
        const node = purchases.edges[i].node;
        if (
          node.name === SHOPIFY_CHARGE_NAME &&
          (!isProd || !node.test) &&
          node.status === "ACTIVE"
        ) {
          hasPayment = true;
          break;
        }
      }

      endCursor = purchases.pageInfo.endCursor;
    } while (purchases.pageInfo.hasNextPage && !hasPayment);
  }

  return hasPayment;
}

async function requestPayment(session, { amount, currencyCode, interval }) {
  const client = new Shopify.Clients.Graphql(session.shop, session.accessToken);
  const returnUrl = `https://${Shopify.Context.HOST_NAME}?shop=${
    session.shop
  }&host=${btoa(`${session.shop}/admin`)}`;

  let data;
  if (isRecurring(interval)) {
    const mutationResponse = await requestRecurringPayment(client, returnUrl, {
      amount,
      currencyCode,
      interval,
    });
    data = mutationResponse.body.data.appSubscriptionCreate;
  } else {
    const mutationResponse = await requestSinglePayment(client, returnUrl, {
      amount,
      currencyCode,
    });
    data = mutationResponse.body.data.appPurchaseOneTimeCreate;
  }

  if (data.userErrors.length) {
    throw new ShopifyBillingError(
      "Error while billing the store",
      data.userErrors
    );
  }

  return data.confirmationUrl;
}

async function requestRecurringPayment(
  client,
  returnUrl,
  { amount, currencyCode, interval }
) {
  const mutationResponse = await client.query({
    data: {
      query: `
        mutation test(
          $name: String!
          $lineItems: [AppSubscriptionLineItemInput!]!
          $returnUrl: URL!
          $test: Boolean
        ) {
          appSubscriptionCreate(
            name: $name
            lineItems: $lineItems
            returnUrl: $returnUrl
            test: $test
          ) {
            confirmationUrl
            userErrors {
              field
              message
            }
          }
        }
      `,
      variables: {
        name: SHOPIFY_CHARGE_NAME,
        lineItems: [
          {
            plan: {
              appRecurringPricingDetails: {
                interval,
                price: {
                  amount,
                  currencyCode,
                },
              },
            },
          },
        ],
        returnUrl,
        test: !isProd,
      },
    },
  });

  if (mutationResponse.body.errors && mutationResponse.body.errors.length) {
    throw new ShopifyBillingError(
      "Error while billing the store",
      mutationResponse.body.errors
    );
  }

  return mutationResponse;
}

async function requestSinglePayment(
  client,
  returnUrl,
  { amount, currencyCode }
) {
  const mutationResponse = await client.query({
    data: {
      query: `
        mutation test(
          $name: String!
          $price: MoneyInput!
          $returnUrl: URL!
          $test: Boolean
        ) {
          appPurchaseOneTimeCreate(
            name: $name
            price: $price
            returnUrl: $returnUrl
            test: $test
          ) {
            confirmationUrl
            userErrors {
              field
              message
            }
          }
        }
      `,
      variables: {
        name: SHOPIFY_CHARGE_NAME,
        price: {
          amount,
          currencyCode,
        },
        returnUrl,
        test: process.env.NODE_ENV !== "production",
      },
    },
  });

  if (mutationResponse.body.errors && mutationResponse.body.errors.length) {
    throw new ShopifyBillingError(
      "Error while billing the store",
      mutationResponse.body.errors
    );
  }

  return mutationResponse;
}

function isRecurring(interval) {
  return RECURRING_INTERVALS.includes(interval);
}

export function ShopifyBillingError(message, errorData) {
  this.name = "ShopifyBillingError";
  this.stack = new Error().stack;

  this.message = message;
  this.errorData = errorData;
}
ShopifyBillingError.prototype = new Error();
