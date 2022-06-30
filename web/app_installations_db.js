/*
  This file interacts with the app's database and is used to track app installations.
*/

import sqlite3 from "sqlite3";
import path from "path";

const DEFAULT_DB_FILE = path.join(process.cwd(), "app_installations_db.sqlite");

export const AppInstallationsDB = {
  appInstallationsTableName: "app_installations",
  db: null,
  ready: null,

  create: async function ({
    shopDomain,
    shopScope,
  }) {
    await this.ready;

    const query = `
      INSERT INTO ${this.appInstallationsTableName}
      (shopDomain, shopScope)
      VALUES (?, ?)
      RETURNING id;
    `;

    const rawResults = await this.__query(query, [
      shopDomain,
      shopScope,
    ]);

    return rawResults[0].id;
  },

  read: async function (shopDomain) {
    await this.ready;
    const query = `
      SELECT * FROM ${this.appInstallationsTableName}
      WHERE shopDomain = ?;
    `;
    const rows = await this.__query(query, [shopDomain]);
    if (!Array.isArray(rows) || rows?.length !== 1) return undefined;

    return rows[0];
  },

  update: async function (
    id,
    {
      shopDomain,
      shopScope,
    }
  ) {
    await this.ready;

    const query = `
      UPDATE ${this.appInstallationsTableName}
      SET
        shopDomain = ?,
        shopScope = ?
      WHERE
        id = ?;
    `;

    await this.__query(query, [
      shopDomain,
      shopScope,
      id,
    ]);
    return true;
  },

  delete: async function (shopDomain) {
    await this.ready;
    const query = `
      DELETE FROM ${this.appInstallationsTableName}
      WHERE shopDomain = ?;
    `;
    await this.__query(query, [shopDomain]);
    return true;
  },

  createOrUpdate: async function ({
    shopDomain,
    shopScope,
  }) {
    await this.ready;

    const id = await this.read(shopDomain);
    if (id) {
      return this.update(id, {
        shopDomain,
        shopScope,
      });
    } else {
      return this.create({
        shopDomain,
        shopScope,
      });
    }
  },

  // Private

  /*
    Used to check whether to create the database.
    Also used to make sure the database and table are set up before the server starts.
  */

  __hasAppInstallationsTable: async function () {
    const query = `
      SELECT name FROM sqlite_schema
      WHERE
        type = 'table' AND
        name = ?;
    `;
    const rows = await this.__query(query, [this.appInstallationsTableName]);
    return rows.length === 1;
  },

  /* Initializes the connection with the app's sqlite3 database */
  init: async function () {
    /* Initializes the connection to the database */
    this.db = this.db ?? new sqlite3.Database(DEFAULT_DB_FILE);

    const hasAppInstallationsTable = await this.__hasAppInstallationsTable();

    if (hasAppInstallationsTable) {
      this.ready = Promise.resolve();

      /* Create the App Installations table if it hasn't been created */
    } else {
      const query = `
        CREATE TABLE ${this.appInstallationsTableName} (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          shopDomain VARCHAR(511) NOT NULL,
          shopScope VARCHAR(511) NOT NULL,
          createdAt DATETIME NOT NULL DEFAULT (datetime(CURRENT_TIMESTAMP, 'localtime'))
        )
      `;

      /* Tell the various CRUD methods that they can execute */
      this.ready = this.__query(query);
    }
  },

  /* Perform a query on the database. Used by the various CRUD methods. */
  __query: function (sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  },
};
