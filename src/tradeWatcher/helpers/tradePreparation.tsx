import { UserVitals } from "../../querySystem/dbTypes";
import { ethers } from "ethers";
import { INFURA_KOVAN, INFURA_MAINNET } from "../../env";
import abiAddress from "../../ABIs/abiAddress";
import LendingPoolABI from "../../ABIs/LendingPool.json";
import ProtocolDAtaProviderABI from "../../ABIs/ProtocolDataProvider.json";
import PriceOracleABI from "../../ABIs/PriceOracle.json";
import { normalize } from "../../calcSystem/helpers/pool-math";
// import BigNumber from "bignumber.js";
import { getBestDebtAsset, gestBestCollateral } from "./optimizationCalcs";
import { NETWORK } from "../../env";

import _ from "lodash";
import FileSync from "lowdb/adapters/FileSync";
import { Schema } from "../../querySystem/dbTypes";
import low from "lowdb";
import path from "path";

// potential gain = (debtToCover (in ETH) / collateral price) * 10**colDecimals * liquidationBonus
//
// scan through all debt position assets
// convert total debt (of the asset) into ETH - select the highest one
// scan through all collaterals
// run potential gain formula, choose the highest one
//
// my call to liquidationCall should have
// collateral address ; debt address
// user address ; amount de bt will pay uint256 (max 50%) ; bool receive Atoken or not
//

const db_path = path.resolve(__dirname, "../../db/db.json");

async function prepareTrades(candidatesArray: UserVitals[]) {
  const adapter = new FileSync<Schema>(db_path);
  const dbConn = await low(adapter);

  const infuraKey = NETWORK === "kovan" ? INFURA_KOVAN : INFURA_MAINNET;

  const provider = new ethers.providers.JsonRpcProvider(infuraKey);
  const lendingPool = new ethers.Contract(
    NETWORK === "kovan"
      ? abiAddress["LendingPool"]["kovan"]
      : abiAddress["LendingPool"]["mainnet"],
    LendingPoolABI,
    provider
  );
  const protocolDataProvider = new ethers.Contract(
    NETWORK === "kovan"
      ? abiAddress["ProtocolDataProvider"]["kovan"]
      : abiAddress["ProtocolDataProvider"]["mainnet"],
    ProtocolDAtaProviderABI,
    provider
  );
  const priceOracle = new ethers.Contract(
    NETWORK === "kovan"
      ? abiAddress["PriceOracle"]["kovan"]
      : abiAddress["PriceOracle"]["mainnet"],
    PriceOracleABI,
    provider
  );

  const scannedCandidates = await Promise.all(
    _.map(candidatesArray, async (candidateData: UserVitals) => {
      // double check healthFactor

      try {
        const userDataOnChain = await lendingPool.getUserAccountData(
          ethers.utils.getAddress(candidateData.id)
        );

        const hfChain = parseFloat(
          normalize(userDataOnChain["healthFactor"].toString(), 18)
        );

        if (hfChain >= 1) {
          const idFail = ethers.utils.getAddress(candidateData.id);
          return {
            id: idFail,
            type: "Fail",
            reason: "Health Factor on chain above 1",
          };
        } else {
          //check each reserve from user is the most profitable
          const userDataDB = await dbConn
            .get("users")
            .find({ id: candidateData.id })
            .value();

          if (userDataDB !== undefined) {
            const bestDebtAsset = await getBestDebtAsset(
              candidateData.id,
              userDataDB,
              protocolDataProvider,
              priceOracle
            );

            const bestCollateralAsset = await gestBestCollateral(
              candidateData.id,
              userDataDB,
              protocolDataProvider,
              priceOracle,
              bestDebtAsset["currentTotalDebtEthRaw"]
            );

            return {
              ...bestDebtAsset,
              ...bestCollateralAsset,
              type: "sucess",
            };
          } else {
            return {
              user: ethers.utils.getAddress(candidateData.id),
              debtAsset: "",
              debtAssetAddress: "",
              currentTotalDebtEth: 0,
              debtValueForLoan: "",
              currentTotalDebtEthRaw: 0,
              maxRawardInEth: 0,
              collateralAsset: "",
              collateralAssetAddress: "",
              collateralPotentialGain: 0,
              collateralNeedCoverage: 0,
              type: "fail - couldn't find on DB",
            };
          }
        }
      } catch (error) {
        console.log(error);
        return {
          user: ethers.utils.getAddress(candidateData.id),
          debtAsset: "",
          debtAssetAddress: "",
          currentTotalDebtEth: 0,
          debtValueForLoan: "",
          currentTotalDebtEthRaw: 0,
          maxRawardInEth: 0,
          collateralAsset: "",
          collateralAssetAddress: "",
          collateralPotentialGain: 0,
          collateralNeedCoverage: 0,
          type: "fail - couldn't run preparation calculations",
        };
      }
    })
  );

  const potentialTrades = _.orderBy(
    scannedCandidates,
    ["maxRawardInEth"],
    ["desc"]
  );

  return potentialTrades;
}

export default prepareTrades;
