import { dbConn } from "../dbConnection";
import _ from "lodash";

const data = dbConn.get("userVitals").value();

const result = _.filter(data, (arrayEl) => {
  return arrayEl.healthFactorNum <= 1.5 && arrayEl.totalBorrowsETH !== "0";
});

console.log(result);
// console.log(data);
