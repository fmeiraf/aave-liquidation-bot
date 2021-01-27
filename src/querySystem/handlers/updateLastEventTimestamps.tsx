import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";
import chalk from "chalk";
import path from "path";
import { Schema } from "../dbTypes";
import _ from "lodash";
import { getLastTimestamps } from "../graphql/queries";

const db_path = path.resolve(__dirname, "../../db/db.json");

const updateLastEventsTimestamps: any = async () => {
  const adapter = new FileSync<Schema>(db_path);
  const db = await low(adapter);

  const latestTimestamps = await getLastTimestamps();
  db.set("lastEventTimestamps", latestTimestamps).write();

  console.log(chalk.magenta("Updated last event timestamps!"));
};

export default updateLastEventsTimestamps;
