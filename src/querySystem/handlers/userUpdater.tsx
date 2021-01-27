import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";
import chalk from "chalk";
import path from "path";
import { Schema } from "../dbTypes";
import _ from "lodash";
import { getUsersToUpdate, getUserData } from "../graphql/queries";
import updateLastEventsTimestamps from "./updateLastEventTimestamps";

const db_path = path.resolve(__dirname, "../../db/db.json");

const updateUsers = async () => {
  console.log(chalk.cyan("Starting user update check."));
  const adapter = new FileSync<Schema>(db_path);
  const db = await low(adapter);

  const lastEventTimestampsObj = db.get("lastEventTimestamps").value();

  // event names used on db
  const events: Array<string> = [
    "Deposit",
    "Borrow",
    "Repay",
    "Swap",
    "LiquidationCall",
  ];

  // getting parameters to cal getUsersToUpdate
  const varMap: { [key: string]: number } = {};

  for (var event of events) {
    const eventObj = _.filter(lastEventTimestampsObj, ["eventName", event])[0];
    varMap[event] = eventObj["timestamp"];
  }

  // getting addresses to update
  const usersToUpdate: Array<string> = await getUsersToUpdate(
    varMap["Borrow"],
    varMap["Deposit"],
    varMap["LiquidationCall"],
    varMap["Repay"],
    varMap["Swap"]
  );

  console.log(chalk.yellow(`Got ${usersToUpdate.length} users to update.`));

  // updating all users info on db (or include if new user)

  let userUpdates: number = 0;
  let newUsersAdded: number = 0;

  for (var user of usersToUpdate) {
    const userData = await getUserData(user);

    const checkUserExistence = db
      .get("users")
      .find({ id: user })
      .value();

    if (checkUserExistence === undefined) {
      db.get("users")
        .push(userData)
        .write();
      newUsersAdded += 1;
    } else {
      db.get("users")
        .find({ id: user })
        .assign(userData)
        .write();
      userUpdates += 1;
    }
  }

  console.log(
    chalk.yellow(
      `UPDATES DONE! New users added: ${newUsersAdded},  Users updated: ${userUpdates}`
    )
  );

  // update events last index
  await updateLastEventsTimestamps();
  console.log(chalk.cyan("Finished user update check."));
};

export default updateUsers;
