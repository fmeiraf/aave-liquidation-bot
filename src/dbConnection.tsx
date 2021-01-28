import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";
import path from "path";
import { Schema } from "./querySystem/dbTypes";

const db_path = path.resolve(__dirname, "./db/db.json");

const adapter = new FileSync<Schema>(db_path);
export const dbConn = low(adapter);

export function dbConnect(path: string) {
  const adapter = new FileSync<Schema>(path);
  const dbConn = low(adapter);
  return dbConn;
}
