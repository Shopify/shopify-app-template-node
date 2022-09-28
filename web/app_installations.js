export const AppInstallations = {
  includes: async function (shopDomain, shopify) {
    const shopSessions = await shopify.config.sessionStorage.findSessionsByShop(shopDomain);

    if (shopSessions.length > 0) {
      for (const session of shopSessions) {
        if (session.accessToken) return true;
      }
    }

    return false;
  },

  delete: async function (shopDomain, shopify) {
    const shopSessions = await shopify.config.sessionStorage.findSessionsByShop(shopDomain);
    if (shopSessions.length > 0) {
      await shopify.config.sessionStorage.deleteSessions(shopSessions.map((session) => session.id));
    }
  },
};
