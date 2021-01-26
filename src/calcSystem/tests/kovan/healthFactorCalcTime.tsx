import { getCommonInfo } from "./kovanTestConfig";
import { computeRawUserSummaryData } from "../../helpers/main-calcs";

import _ from "lodash";
import { performance } from "perf_hooks";

const healthFactorCalcTime = async () => {
  const currentTimeStamp = Math.round(Date.now() / 1000);

  const { allUsersDB, allReservesDB } = await getCommonInfo();

  //running all users
  let userCount = 0;
  const t0 = performance.now();
  allUsersDB.map((user: any) => {
    userCount++;

    const computedRawUserData = computeRawUserSummaryData(
      allReservesDB,
      user.reserves,
      user.id,
      1500,
      currentTimeStamp
    );

    return computedRawUserData;
  });

  const t1 = performance.now();
  console.log(
    `\nCalculation for ${userCount} users took (seconds) : ${(t1 - t0) / 1000}`
  );
  console.log(
    `Average calculation time per user: ${(t1 - t0) / 1000 / userCount}`
  );
};

export default healthFactorCalcTime;
