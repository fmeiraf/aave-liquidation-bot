import {
  daiAddress,
  testAddressLower,
  protocolDataProvider,
} from "./kovanTestConfig";
import { poolReserve } from "../../../querySystem/dbTypes";
import { computeUserReserveData } from "../../helpers/main-calcs";

import { ethers } from "ethers";
import dbConn from "../../../dbConnection";
import _ from "lodash";
import chalk from "chalk";

const userReserveTest = async () => {
  const currentTimeStamp = Math.round(Date.now() / 1000);
  const userReserveOnChain = await protocolDataProvider.getUserReserveData(
    daiAddress,
    ethers.utils.getAddress(testAddressLower)
  );

  const userReservesDB = await dbConn
    .get("users")
    .find({
      id: testAddressLower,
    })
    .value();

  const userDaiReserve: any = _.find(userReservesDB["reserves"], {
    reserve: { symbol: "DAI" },
  });

  const daiReserveDB: poolReserve = await dbConn
    .get("poolReserves")
    .find({
      symbol: "DAI",
    })
    .value();

  const computedUserReserve = computeUserReserveData(
    daiReserveDB,
    userDaiReserve,
    1500,
    currentTimeStamp
  );

  let atokenResult;
  let stableDebtResult;
  let variableDebtResult;

  // aToken testing
  if (userDaiReserve["scaledATokenBalance"] === "0") {
    atokenResult =
      userReserveOnChain["currentATokenBalance"].toString() === "0";
  } else {
    atokenResult =
      userReserveOnChain["currentATokenBalance"].toString().substr(0, 6) ===
      computedUserReserve["scaledATokenBalance"].substr(0, 6);
  }
  console.log(
    `Checking aToken calculation: ${
      atokenResult ? chalk.bold.green("PASS!") : chalk.bold.red("FAIL!")
    } `
  );

  // stableDebt testing
  if (userDaiReserve["principalStableDebt"] === "0") {
    stableDebtResult =
      userReserveOnChain["currentStableDebt"].toString() === "0";
  } else {
    stableDebtResult =
      userReserveOnChain["currentStableDebt"].toString().substr(0, 6) ===
      computedUserReserve["stableBorrows"].substr(0, 6);
  }
  console.log(
    `Checking Stable Debt calculation: ${
      stableDebtResult ? chalk.bold.green("PASS!") : chalk.bold.red("FAIL!")
    } `
  );

  // variable debt testing
  if (userDaiReserve["scaledVariableDebt"] === "0") {
    variableDebtResult =
      userReserveOnChain["currentVariableDebt"].toString() === "0";
  } else {
    variableDebtResult =
      userReserveOnChain["currentVariableDebt"].toString().substr(0, 6) ===
      computedUserReserve["variableBorrows"].substr(0, 6);
  }
  console.log(
    `Checking Variable Debt calculation: ${
      variableDebtResult ? chalk.bold.green("PASS!") : chalk.bold.red("FAIL!")
    } `
  );

  console.log(userReserveOnChain["currentVariableDebt"].toString());
  console.log(computedUserReserve["variableBorrows"]);

  return [computedUserReserve, userReserveOnChain];
};

export default userReserveTest;
