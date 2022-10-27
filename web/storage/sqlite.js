import { Session } from "@shopify/shopify-api";
import sqlite3 from "sqlite3";

import shopify from "../shopify.js";

const defaultSQLiteSessionStorageOptions = {
  sessionTableName: "shopify_sessions",
};

export class SQLiteSessionStorage {
  constructor(filename, opts) {
    this.filename = filename;
    this.options = { ...defaultSQLiteSessionStorageOptions, ...opts };
    this.db = new sqlite3.Database(this.filename);
    this.ready = this.init();
  }

  async storeSession(session) {
    await this.ready;

    const entries = session.serialize();

    const query = `
      INSERT OR REPLACE INTO ${this.options.sessionTableName}
      (${entries.map(([key]) => key).join(", ")})
      VALUES (${entries.map(() => "?").join(", ")});
    `;

    await this.query(
      query,
      entries.map(([_key, value]) => value)
    );
    return true;
  }

  async loadSession(id) {
    await this.ready;
    const query = `
      SELECT * FROM ${this.options.sessionTableName}
      WHERE id = ?;
    `;
    const rows = await this.query(query, [id]);
    if (!Array.isArray(rows) || rows?.length !== 1) return undefined;
    const rawResult = rows[0];

    return Session.deserialize(Object.entries(rawResult));
  }

  async hasShop(shop) {
    await this.ready;
    const query = `
      SELECT COUNT(1) AS count FROM ${this.options.sessionTableName}
      WHERE shop = ?;
    `;
    const rows = await this.query(query, [shop]);
    return rows[0].count > 0;
  }

  async deleteForShop(shop) {
    await this.ready;
    const query = `DELETE FROM ${this.options.sessionTableName} WHERE shop = ?;`;
    await this.query(query, [shop]);
  }

  async hasSessionTable() {
    const query = `
    SELECT name FROM sqlite_schema
    WHERE
      type = 'table' AND
      name = ?;
    `;
    const rows = await this.query(query, [this.options.sessionTableName]);
    return rows.length === 1;
  }

  async init() {
    const hasSessionTable = await this.hasSessionTable();
    if (!hasSessionTable) {
      const query = `
        CREATE TABLE ${this.options.sessionTableName} (
          id varchar(255) NOT NULL PRIMARY KEY,
          shop varchar(255) NOT NULL,
          state varchar(255) NOT NULL,
          isOnline integer NOT NULL,
          expires integer,
          scope varchar(255),
          accessToken varchar(255),
          onlineAccessInfo varchar(255)
        )
      `;
      await this.query(query);
    }
  }

  query(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  }
}

const DB_PATH = `${process.cwd()}/database.sqlite`;
export const storage = new SQLiteSessionStorage(DB_PATH);
