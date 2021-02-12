import { dbConn } from "../dbConnection";
import _ from "lodash";

import prepareTrades from "./helpers/tradePreparation";
// import { normalize } from "../calcSystem/helpers/pool-math";

export async function findTrades() {
  const data = dbConn.get("userVitals").value();

  const usersUnderHF = _.orderBy(
    _.filter(data, (arrayEl) => {
      return arrayEl.healthFactorNum < 1 && arrayEl.totalBorrowsETH !== "0";
    }),
    ["totalCollateralETHNum"],
    ["desc"]
  );

  // check potential candidates and prepare their call data
  const potentialTrades = await prepareTrades(usersUnderHF);

  console.log(potentialTrades);

  return potentialTrades;
}

findTrades();
