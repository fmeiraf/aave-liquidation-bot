import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";
import chalk from "chalk";
import path from "path";
import { Schema } from "../dbTypes";
import _ from "lodash";
import { getReservesData } from "../graphql/queries";

const db_path = path.resolve(__dirname, "../../../../src/db/db.json");

const updatePoolReserves: any = async () => {
  const adapter = new FileSync<Schema>(db_path);
  const db = await low(adapter);

  const reservesData = await getReservesData();
  db.set("poolReserves", reservesData).write();

  console.log(chalk.magenta("Updated pool reserves!"));
};

export default updatePoolReserves;
