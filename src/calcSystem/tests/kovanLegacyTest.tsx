import userReserveTest from "./kovan/userReserveTest";
import userAccountDataTest from "./kovan/userAccountTest";
import healthFactorValue from "./kovan/healthFactorValue";
import healthFactorCalcTime from "./kovan/healthFactorCalcTime";
import chalk from "chalk";

import updateUsers from "../../querySystem/handlers/userUpdater";
import updatePoolReserves from "../../querySystem/handlers/updatePoolReserves";

async function run() {
  // update users and pool records for more accurate results
  await updateUsers();
  await updatePoolReserves();

  // calling tests
  console.log(
    chalk.bold.cyanBright("\n Testing User Reserve Data calculations")
  );
  await userReserveTest();

  console.log(
    chalk.bold.cyanBright("\n Testing User Account Data calculations")
  );
  await userAccountDataTest();

  console.log(
    chalk.bold.cyanBright("\n Testing Health Factor Individual Calculation")
  );
  await healthFactorValue();

  console.log(
    chalk.bold.cyanBright("\n Testing Health Factor Calculation Time")
  );
  await healthFactorCalcTime();
}

run();
