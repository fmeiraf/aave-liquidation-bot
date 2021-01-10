import fs from "fs-extra";
import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";
import chalk from "chalk";
import path from "path";
import { promises as fsPromises } from "fs";
import { Schema } from "./dbTypes";
import { loadInitialUsers } from "./graphql/queries";
import updateLastEventsTimestamps from "./handlers/updateLastEventTimestamps";

// types for the db schema

// GOTCHA: path relative to the build folder..
const db_path = path.resolve(__dirname, "../../../src/db/db.json");

async function start() {
  try {
    console.log(chalk.bold.greenBright("### Starting Query System .. ###"));

    //check if db.json exists, if not, create db and initial run config
    if (!fs.existsSync(db_path)) {
      await fsPromises.writeFile(db_path, "");
      console.log(chalk.yellow("Created new DB file "));

      //create default format for db
      const adapter = new FileSync<Schema>(db_path);
      const db = await low(adapter);

      db.defaults({
        users: [],
        lastEventTimestamps: [],
        // generalReserves: [],
      }).write();

      // insert into db timestamp of the last update
      console.log(chalk.green("Loading initial data.."));

      updateLastEventsTimestamps();

      // fill with with all users

      const initialUsers: any = await loadInitialUsers();

      db.set("users", [initialUsers[0]]).write();
    }

    console.log(chalk.bold.greenBright("### Starting Watch Mode .. ###"));

    // start querying for events of interest using the last index from
    // previous step
  } catch (error) {
    console.log(error);
  }
}

start();
