import { Shopify } from "@shopify/shopify-api";

export const AppInstallations = {
  includes: async function (shopDomain) {
    const shopSessions = Shopify.Context.SESSION_STORAGE.findSessionsByShop(shopDomain);

    if (shopSessions) {
      for (const session in shopSessions) {
        if (session.accessToken) return true;
      }
    }

    return false;
  },

  delete: async function (shopDomain) {
    const shopSessions = Shopify.Context.SESSION_STORAGE.findSessionsByShop(shopDomain);
    if (shopSessions) {
      return Shopify.Context.SESSION_STORAGE.deleteSessions(shopSessions.map((session) => session.id));
    }
  },
};
