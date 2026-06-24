import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.resolve(
  process.cwd(),
  "../nyc-events-agent/events.db"
);

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
  }
  return db;
}
