import { User, UserSummaryDataOpt, poolReserve } from "../querySystem/dbTypes";
import { computeRawUserSummaryDataOpt } from "./helpers/main-calcs";

import _ from "lodash";
import path from "path";
import chalk from "chalk";
import { performance } from "perf_hooks";
import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";
import { Schema } from "../querySystem/dbTypes";

const db_path = path.resolve(__dirname, "../db/db.json");

export async function calcAllUsersData() {
  //   const dbConn = dbConnect(db_path);
  const adapter = new FileSync<Schema>(db_path);
  const dbConn = await low(adapter);
  const users: User[] = await dbConn.get("users").value();
  const reserves: poolReserve[] = await dbConn.get("poolReserves").value();

  const t0 = performance.now();
  let userCount = 0;
  const userData = users.map((user: User) => {
    userCount++;

    const currentTimeStamp = Math.round(Date.now() / 1000);

    const computedRawUserData: UserSummaryDataOpt = computeRawUserSummaryDataOpt(
      reserves,
      user.reserves,
      user.id,
      currentTimeStamp
    );

    return {
      ...computedRawUserData,
      healthFactorNum: parseFloat(computedRawUserData.healthFactor.toString()),
    };
  });

  const t1 = performance.now();

  await dbConn.set("userVitals", userData).write();

  console.log(
    chalk.cyanBright(
      `Updated users vital KPIs. Took ${(t1 - t0) /
        1000} seconds, for ${userCount} users. `
    )
  );
}
