import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";
import chalk from "chalk";
import path from "path";
import { Schema } from "../dbTypes";
import _ from "lodash";
import { getReservesData, getBlockNumber } from "../graphql/queries";

const db_path = path.resolve(__dirname, "../../db/db.json");

const updatePoolReserves: any = async () => {
  const adapter = new FileSync<Schema>(db_path);
  const db = await low(adapter);

  const reservesData = await getReservesData();
  db.set("poolReserves", reservesData).write();

  const blockData = await getBlockNumber();
  db.set("blockInfo", blockData).write();

  console.log(chalk.magenta("Updated pool reserves (and blockNumber!"));
};

export default updatePoolReserves;
