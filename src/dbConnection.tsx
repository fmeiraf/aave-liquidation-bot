import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";
import path from "path";
import { Schema } from "./querySystem/dbTypes";

const db_path = path.resolve(__dirname, "./db/db.json");

const adapter = new FileSync<Schema>(db_path);
const dbConn = low(adapter);

export default dbConn;
