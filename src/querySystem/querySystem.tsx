import fs from "fs-extra";
import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";
import chalk from "chalk";
import path from "path";
import { promises as fsPromises } from "fs";
import { Schema } from "./dbTypes";
import { getLastTimestamps, loadInitialUsers } from "./graphql/queries";

// types for the db schema

// import { loadInitialUsers } from "./graphql/queries";

// GOTCHA: path relative to the build folder..
const db_path = path.resolve(__dirname, "../../../src/db/db.json");

async function start() {
  try {
    console.log(chalk.greenBright("### Starting Query System .. ###"));

    //check if db.json exists, if not, create db and initial run config
    if (!fs.existsSync(db_path)) {
      await fsPromises.writeFile(db_path, "");
      console.log(chalk.yellow("Created new DB file "));
    }

    //create default format for db
    const adapter = new FileSync<Schema>(db_path);
    const db = await low(adapter);

    db.defaults({
      users: [],
      lastEventTimestamp: [],
      // generalReserves: [],
    }).write();

    // insert into db timestamp of the last update
    console.log(chalk.green("Loading initial data.."));

    const latestTimestamps = await getLastTimestamps();
    db.set("lastEventTimestamp", latestTimestamps).write();

    // fill with with all users

    const initialUsers: any = await loadInitialUsers();

    db.get("users")
      .push(initialUsers[0])
      .push(initialUsers[1])
      .write();

    // db.set("users[0]").write();

    // start querying for events of interest using the last index from
    // previous step
  } catch (error) {
    console.log(error);
  }
}

start();
