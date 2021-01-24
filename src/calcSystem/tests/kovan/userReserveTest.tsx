import { getCommonInfo } from "./kovanTestConfig";

import { computeUserReserveData } from "../../helpers/main-calcs";
import { normalizeNoDecimals } from "../../helpers/pool-math";

import _ from "lodash";
import chalk from "chalk";

const userReserveTest = async () => {
  const currentTimeStamp = Math.round(Date.now() / 1000);

  const [
    userReserveOnChain,
    userDaiReserve,
    daiReserveDB,
  ] = await getCommonInfo();

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
  const currATokenChain = userReserveOnChain["currentATokenBalance"].toString();
  let eqAChain = 0;
  if (userDaiReserve["scaledATokenBalance"] === "0") {
    atokenResult =
      userReserveOnChain["currentATokenBalance"].toString() === "0";
  } else {
    for (let i = 0; i < currATokenChain.length; i++) {
      if (computedUserReserve["underlyingBalance"][i] === currATokenChain[i]) {
        eqAChain++;
      } else {
        break;
      }
    }
  }

  const aNonDecimalSize = normalizeNoDecimals(
    userReserveOnChain["currentATokenBalance"].toString(),
    18
  ).length;

  if (atokenResult === undefined) {
    atokenResult = eqAChain >= aNonDecimalSize; //covers at least integer pasrt
  }

  console.log(
    `Checking A Token calculation: ${
      atokenResult ? chalk.bold.green("PASS!") : chalk.bold.red("FAIL!")
    }, with ${eqAChain - aNonDecimalSize} decimals of accuracy.`
  );

  // stableDebt testing
  const currStableDebtChain = userReserveOnChain[
    "currentStableDebt"
  ].toString();
  let eqCountStable = 0;
  if (userDaiReserve["principalStableDebt"] === "0") {
    stableDebtResult = currStableDebtChain === "0";
  } else {
    for (let i = 0; i < currStableDebtChain.length; i++) {
      if (computedUserReserve["stableBorrows"][i] === currStableDebtChain[i]) {
        eqCountStable++;
      } else {
        break;
      }
    }
  }

  const stableNonDecimalSize = normalizeNoDecimals(
    userReserveOnChain["currentStableDebt"].toString(),
    18
  ).length;

  if (stableDebtResult === undefined) {
    stableDebtResult = eqCountStable >= stableNonDecimalSize; //covers at least integer pasrt
  }

  console.log(
    `Checking Stable Debt calculation: ${
      stableDebtResult ? chalk.bold.green("PASS!") : chalk.bold.red("FAIL!")
    }, with ${eqCountStable - stableNonDecimalSize} decimals of accuracy.`
  );

  // variable debt testing
  const currVariableDebtChain = userReserveOnChain[
    "currentVariableDebt"
  ].toString();
  let eqCountVar = 0;
  if (userDaiReserve["scaledVariableDebt"] === "0") {
    variableDebtResult =
      userReserveOnChain["currentVariableDebt"].toString() === "0";
  } else {
    for (let i = 0; i < currVariableDebtChain.length; i++) {
      if (
        computedUserReserve["variableBorrows"][i] === currVariableDebtChain[i]
      ) {
        eqCountVar++;
      } else {
        break;
      }
    }
  }

  const variableNonDecimalSize = normalizeNoDecimals(
    userReserveOnChain["currentVariableDebt"].toString(),
    18
  ).length;

  if (variableDebtResult === undefined) {
    variableDebtResult = eqCountVar >= variableNonDecimalSize; //covers at least integer part
  }

  console.log(
    `Checking Variable Debt calculation: ${
      variableDebtResult ? chalk.bold.green("PASS!") : chalk.bold.red("FAIL!")
    }, with ${eqCountVar - variableNonDecimalSize} decimals of accuracy.`
  );

  return [computedUserReserve, userReserveOnChain];
};

export default userReserveTest;
