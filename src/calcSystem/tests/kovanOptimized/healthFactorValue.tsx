import { getCommonInfo } from "./kovanTestConfig";
import { computeRawUserSummaryDataOpt } from "../../helpers/main-calcs";
import { normalize, normalizeNoDecimals } from "../../helpers/pool-math";

import _ from "lodash";
import chalk from "chalk";

const healthFactorValue = async () => {
  const currentTimeStamp = Math.round(Date.now() / 1000);

  const {
    userAccountDataOnChain,
    userReservesDB,
    allReservesDB,
  } = await getCommonInfo();

  const computedRawUserData = computeRawUserSummaryDataOpt(
    allReservesDB,
    userReservesDB.reserves,
    userReservesDB.id,
    currentTimeStamp
  );

  // cuilding the test checkings and conditions

  let hfResult;

  //totalDebtETH

  const hfChain = normalize(
    userAccountDataOnChain["healthFactor"].toString(),
    18
  );
  const hfDecimals = normalizeNoDecimals(
    userAccountDataOnChain["healthFactor"].toString(),
    18
  ).length;
  const hfComputed = computedRawUserData.healthFactor.toString();

  let charCount = 0;
  if (hfChain === "0") {
    hfResult = hfComputed === "0";
  } else {
    for (let i = 0; i < hfComputed.length; i++) {
      if (hfChain[i] === hfComputed[i]) {
        charCount++;
      } else {
        break;
      }
    }
  }

  if (hfResult === undefined) {
    hfResult = charCount - 1 >= hfDecimals; // discounting the . from the normalization
  }

  console.log(`
    Health Factor Calc for ${userReservesDB.id}: ${
    hfResult ? chalk.bold.green("PASS!") : chalk.bold.red("FAIL!")
  }, with ${charCount - 1 - hfDecimals} decimals of accuracy.
  `);

  console.log(`On Chain Value: ${hfChain}`);
  console.log(`Computed Value: ${hfComputed}`);
};

export default healthFactorValue;
