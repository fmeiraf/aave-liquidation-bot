import fs from "fs-extra";
import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";
import chalk from "chalk";
import path from "path";
// import { promises as fsPromises } from "fs";
import { Schema } from "./dbTypes";
import { loadInitialUsers } from "./graphql/queries";
import updateLastEventsTimestamps from "./handlers/updateLastEventTimestamps";
import updatePoolReserves from "./handlers/updatePoolReserves";
import updateUsers from "./handlers/userUpdater";
import { calcAllUsersData } from "../calcSystem/calcSystem";

// types for the db schema
async function updateMode() {
  const now = new Date();
  console.log(`This update is running on ${now.toString()} `);
  await updatePoolReserves();
  await updateUsers();
  await updateLastEventsTimestamps();
  await calcAllUsersData();
}

// GOTCHA: path relative to the build folder..
const db_path = path.resolve(__dirname, "../db/db.json");
console.log(db_path);

export async function runQuerySystem() {
  try {
    console.log(chalk.bold.greenBright("### Starting Query System .. ###"));

    // check if db.json exists, if not, create db and initial run config
    if (!fs.existsSync(db_path)) {
      // await fs.mkdirSync("../db");
      await fs.outputFile(db_path, "");
      console.log(chalk.yellow("Created new DB file "));

      //create default format for db
      const adapter = new FileSync<Schema>(db_path);
      const db = await low(adapter);

      db.defaults({
        users: [],
        lastEventTimestamps: [],
        poolReserves: [],
        userVitals: [],
      }).write();

      // insert into db timestamp of the last update
      console.log(chalk.green("Loading initial data.."));

      // fill with with all users

      const initialUsers: any = await loadInitialUsers();

      db.set("users", initialUsers).write();

      // fill with poolReserves and EventsTimestamps last data
      await updatePoolReserves();
      await updateLastEventsTimestamps();
    }

    console.log(chalk.bold.greenBright("### Starting Watch Mode .. ###"));

    setInterval(await updateMode, 2 * 60 * 1000);
  } catch (error) {
    console.log(error);
  }
}

runQuerySystem();
