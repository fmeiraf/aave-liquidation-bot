import { ethers } from "ethers";
import { INFURA_KOVAN } from "../../../env";
import abiAddress from "../../../ABIs/abiAddress";
import ProtocolDAtaProviderABI from "../../../ABIs/ProtocolDataProvider.json";
import LendingPoolABI from "../../../ABIs/LendingPool.json";

import { dbConn } from "../../../dbConnection";
import _ from "lodash";
import { poolReserve } from "../../../querySystem/dbTypes";

//addresses
export const daiAddress = "0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD";
export const daiAddressLower = "0xff795577d9ac8bd7d90ee22b6c1703490b6512fd";
export const testAddressLower = "0xaea2df19506ea7bc1b3aa82f29a3115c77f0c21e";

//configs

const provider = new ethers.providers.JsonRpcProvider(INFURA_KOVAN);

export const protocolDataProvider = new ethers.Contract(
  abiAddress["ProtocolDataProvider"]["kovan"],
  ProtocolDAtaProviderABI,
  provider
);

export const lendingPool = new ethers.Contract(
  abiAddress["LendingPool"]["kovan"],
  LendingPoolABI,
  provider
);

// common info for tests
export async function getCommonInfo() {
  const userReserveOnChain = await protocolDataProvider.getUserReserveData(
    daiAddress,
    ethers.utils.getAddress(testAddressLower)
  );

  const userAccountDataOnChain = await lendingPool.getUserAccountData(
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

  const allReservesDB: any = await dbConn.get("poolReserves").value();

  const allUsersDB: any = await dbConn.get("users").value();

  const daiReserveDB: poolReserve = await dbConn
    .get("poolReserves")
    .find({
      symbol: "DAI",
    })
    .value();

  return {
    userReserveOnChain,
    userReservesDB,
    userDaiReserve,
    daiReserveDB,
    userAccountDataOnChain,
    allReservesDB,
    allUsersDB,
  };
}
