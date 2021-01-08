import fs from "fs-extra";
import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";
import chalk from "chalk";
import path from "path";
import { promises as fsPromises } from "fs";

// import { loadInitialUsers } from "./graphql/queries";

// GOTCHA: path relative to the build folder..
const db_path = path.resolve(__dirname, "../../../src/db/db.json");

async function start() {
  try {
    console.log(chalk.greenBright("### Starting Query System .. ###"));

    //check if db.json exists, if not, create file
    if (!fs.existsSync(db_path)) {
      await fsPromises.writeFile(db_path, "");
      console.log(chalk.yellow("Created new DB file "));
    }

    //create default format for db
    const adapter = new (FileSync as any)(db_path);
    const db = await low(adapter);

    db.defaults({
      users: [],
      lasEventTimestamp: {},
      generalReserves: [],
    }).write();

    // get last index of events of interest to use on updates

    // call the initial query getting all userReserves
    console.log(chalk.green("Loading initial data.."));

    // db.get("users")
    //   .push({ address: "accbbfd", reservers: [{ a: 1 }, { b: 2 }] })
    //   .write();

    // const initialData = await loadInitialUsers();

    // start querying for events of interest using the last index from
    // previous step
  } catch (error) {
    console.log(error);
  }
}

start();
