import { dbConn } from "../dbConnection";
import _ from "lodash";

async function findTrades() {
  const data = dbConn.get("userVitals").value();

  const result = _.orderBy(
    _.filter(data, (arrayEl) => {
      return arrayEl.healthFactorNum < 1 && arrayEl.totalBorrowsETH !== "0";
    }),
    ["totalCollateralETHNum"],
    ["desc"]
  );

  console.log(result);
  // console.log(data);
}

findTrades();
