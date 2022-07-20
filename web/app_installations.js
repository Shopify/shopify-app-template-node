import { Shopify } from "@shopify/shopify-api";

export const AppInstallations = {
  includes: async function (shopDomain) {
    const shopSessions = Shopify.Context.SESSION_STORAGE.findSessionsByShop(shopDomain);

    if (shopSessions.length > 0) {
      for (const session in shopSessions) {
        if (session.accessToken) return true;
      }
    }

    return false;
  },

  delete: async function (shopDomain) {
    const shopSessions = Shopify.Context.SESSION_STORAGE.findSessionsByShop(shopDomain);
    if (shopSessions.length > 0) {
      Shopify.Context.SESSION_STORAGE.deleteSessions(shopSessions.map((session) => session.id));
    }
  },
};
