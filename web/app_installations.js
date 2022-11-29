import { sqliteSessionStorage } from "./sqlite-session-storage.js";

export const AppInstallations = {
  includes: async function (shopDomain) {
    const shopSessions = await sqliteSessionStorage.findSessionsByShop(
      shopDomain
    );

    if (shopSessions.length > 0) {
      for (const session of shopSessions) {
        if (session.accessToken) return true;
      }
    }

    return false;
  },

  delete: async function (shopDomain) {
    const shopSessions = await sqliteSessionStorage.findSessionsByShop(
      shopDomain
    );
    if (shopSessions.length > 0) {
      await sqliteSessionStorage.deleteSessions(
        shopSessions.map((session) => session.id)
      );
    }
  },
};
