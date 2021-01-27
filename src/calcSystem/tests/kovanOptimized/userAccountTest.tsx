import { getCommonInfo } from "./kovanTestConfig";
import { computeUserReserveDataOpt } from "../../helpers/main-calcs";
import { valueToBigNumber } from "../../helpers/bignumber";
import { normalize, normalizeNoDecimals } from "../../helpers/pool-math";

import _ from "lodash";
import chalk from "chalk";

const userAccountDataTest = async () => {
  const currentTimeStamp = Math.round(Date.now() / 1000);

  const {
    userAccountDataOnChain,
    userReservesDB,
    allReservesDB,
  } = await getCommonInfo();

  // getting all borrow and collateral values for all reserves
  let totalDebtCalc = valueToBigNumber("0");
  let totalCollateralCalc = valueToBigNumber("0");

  _.map(userReservesDB["reserves"], (userReserve) => {
    const poolReserve: any = _.find(allReservesDB, {
      symbol: userReserve["reserve"]["symbol"],
    });

    //run calculations
    const computedValues = computeUserReserveDataOpt(
      poolReserve,
      userReserve,
      currentTimeStamp
    );

    //add computed values to the overall counting variables
    totalDebtCalc = totalDebtCalc.plus(computedValues.totalBorrowsETH);
    totalCollateralCalc = totalCollateralCalc.plus(
      computedValues.underlyingBalanceETH
    );
  });

  // cuilding the test checkings and conditions

  let debtResult;
  let collateralResult;

  //totalDebtETH
  const debtDecimals = normalizeNoDecimals(
    userAccountDataOnChain["totalDebtETH"].toString(),
    18
  ).length;
  const totalDebtOnChain = userAccountDataOnChain["totalDebtETH"].toString();
  let debtCount = 0;
  if (totalDebtOnChain === "0") {
    debtResult = totalDebtCalc.toString() === "0";
  } else {
    for (let i = 0; i < totalDebtOnChain.length; i++) {
      if (totalDebtOnChain[i] === totalDebtCalc.toString()[i]) {
        debtCount++;
      }
    }
  }

  if (debtResult === undefined) {
    debtResult = debtCount >= debtDecimals;
  }
  console.log(`
    Total Debt in ETH: ${
      debtResult ? chalk.bold.green("PASS!") : chalk.bold.red("FAIL!")
    }, with ${debtCount - debtDecimals} decimals of accuracy.
  `);

  console.log(
    `On Chain Value: ${normalize(
      userAccountDataOnChain["totalDebtETH"].toString(),
      18
    )}`
  );
  console.log(`Calculated Value: ${normalize(totalDebtCalc.toString(), 18)}`);

  //totalCollateralETH
  const collateralDecimals = normalizeNoDecimals(
    userAccountDataOnChain["totalCollateralETH"].toString(),
    18
  ).length;
  const totalCollateralOnChain = userAccountDataOnChain[
    "totalCollateralETH"
  ].toString();
  let collCount = 0;
  if (totalCollateralOnChain === "0") {
    collateralResult = totalCollateralCalc.toString() === "0";
  } else {
    for (let i = 0; i < totalCollateralOnChain.length; i++) {
      if (totalCollateralOnChain[i] === totalCollateralCalc.toString()[i]) {
        collCount++;
      }
    }
  }

  if (collateralResult === undefined) {
    collateralResult = collCount >= collateralDecimals;
  }
  console.log(`
    Total Debt in ETH: ${
      collateralResult ? chalk.bold.green("PASS!") : chalk.bold.red("FAIL!")
    }, with ${collCount - collateralDecimals} decimals of accuracy.
  `);

  console.log(
    `On Chain Value: ${normalize(
      userAccountDataOnChain["totalCollateralETH"].toString(),
      18
    )}`
  );
  console.log(
    `Calculated Value: ${normalize(totalCollateralCalc.toString(), 18)}`
  );
};

export default userAccountDataTest;
