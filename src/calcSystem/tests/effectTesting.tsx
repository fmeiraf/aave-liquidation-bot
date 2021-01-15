import { ethers } from "ethers";
import BigNumber from "bignumber.js";
import { INFURA_KOVAN } from "../../env";
import abiAddress from "../../ABIs/abiAddress";
// import LendingPoolABI from "../../ABIs/LendingPool.json";
import ProtocolDAtaProviderABI from "../../ABIs/ProtocolDataProvider.json";
import dbConn from "../../dbConnection";

const assetAddress = "0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD"; // DAI
const myTestAddres = "0xAeA2dF19506eA7bc1b3AA82f29a3115c77f0c21e";
const myTestAddresLower = "0xaea2df19506ea7bc1b3aa82f29a3115c77f0c21e";

const provider = new ethers.providers.JsonRpcProvider(INFURA_KOVAN);

const protocolDAtaProvider = new ethers.Contract(
  abiAddress["ProtocolDataProvider"]["kovan"],
  ProtocolDAtaProviderABI,
  provider
);

async function run() {
  const result = await protocolDAtaProvider.getUserReserveData(
    assetAddress,
    myTestAddres
  );
  const principalStableDebtContract = result["principalStableDebt"];

  const dbData = await dbConn
    .get("users")
    .find({
      id: myTestAddresLower,
    })
    .value();

  const princiaplStableDebtDB = new BigNumber(
    dbData["reserves"][1]["principalStableDebt"]
  );

  console.log(
    `Are these numbers equal? ${principalStableDebtContract.eq(
      princiaplStableDebtDB.toString()
    )}`
  );
}

run();
