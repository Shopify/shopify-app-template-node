import { SQLiteSessionStorage } from "@shopify/shopify-app-session-storage-sqlite";

const dbPath = `${process.cwd()}/database.sqlite`;

export const sqliteSessionStorage = new SQLiteSessionStorage(dbPath);
