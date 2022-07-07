/*
  This file interacts with the app's database and is used to track app installations.
*/
export const AppInstallations = {
  db: null,
  sessionTableName: null,
  ready: null,
  __query: null,

  includes: async function (shopDomain) {
    await this.ready;
    const query = `
      SELECT * FROM ${this.sessionTableName}
      WHERE shop = ?
      AND accessToken IS NOT NULL;
    `;
    const rows = await this.__query(query, [shopDomain]);

    return Array.isArray(rows) && rows?.length === 1;
  },

  delete: async function (shopDomain) {
    await this.ready;
    const query = `
      DELETE FROM ${this.sessionTableName}
      WHERE shop = ?;
    `;
    await this.__query(query, [shopDomain]);
    return true;
  },

  /* Initializes the connection with the app's sqlite3 database */
  init: async function (sessionDb) {
    // Use the (technically private) SQLite DB from the session storage
    // for determining if a shop has installed the app.
    this.db = sessionDb.db;
    this.sessionTableName = sessionDb.options.sessionTableName;
    this.ready = sessionDb.ready;
    this.__query = sessionDb.query;
  },
};
