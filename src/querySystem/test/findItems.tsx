import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";
import path from "path";
import { Schema } from "../dbTypes";

const db_path = path.resolve(__dirname, "../../../../src/db/db.json");

const adapter = new FileSync<Schema>(db_path);
const dbConn = low(adapter);

const address = "0xaea2df19506ea7bc1b3aa82f29a3115c77f0c21e";

const result = dbConn
  .get("users")
  .find({ id: address })
  .value();

console.log(result);
