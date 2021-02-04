import { UserVitals } from "../../querySystem/dbTypes";
import { ethers } from "ethers";
import { INFURA_KOVAN } from "../../env";
import abiAddress from "../../ABIs/abiAddress";
import LendingPoolABI from "../../ABIs/LendingPool.json";
import ProtocolDAtaProviderABI from "../../ABIs/ProtocolDataProvider.json";
import PriceOracleABI from "../../ABIs/PriceOracle.json";
import { normalize } from "../../calcSystem/helpers/pool-math";
import BigNumber from "bignumber.js";
import { NETWORK } from "../../env";

import _ from "lodash";
import FileSync from "lowdb/adapters/FileSync";
import { Schema } from "../../querySystem/dbTypes";
import low from "lowdb";
import path from "path";

const db_path = path.resolve(__dirname, "../../db/db.json");

async function prepareTrades(candidatesArray: UserVitals[]) {
  const adapter = new FileSync<Schema>(db_path);
  const dbConn = await low(adapter);

  const provider = new ethers.providers.JsonRpcProvider(INFURA_KOVAN);
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
          const userCollaterals = _.filter(userDataDB["reserves"], {
            usageAsCollateralEnabledOnUser: true,
          });
          const assetPotentials = await Promise.all(
            _.map(userCollaterals, async (userCollateral) => {
              // get On Chain data to be more accurate

              const userReserveData = await protocolDataProvider.getUserReserveData(
                ethers.utils.getAddress(
                  userCollateral["reserve"]["underlyingAsset"]
                ),
                ethers.utils.getAddress(candidateData["id"])
              );

              const collateralBalance = await userReserveData[
                "currentATokenBalance"
              ];
              const collateralEthPrice = await priceOracle.getAssetPrice(
                ethers.utils.getAddress(
                  userCollateral["reserve"]["underlyingAsset"]
                )
              );

              const assetDecimals = userCollateral["reserve"]["decimals"];

              const totalCollateralInEth = await normalize(
                collateralBalance
                  .mul(collateralEthPrice)
                  .div(new BigNumber("10").pow(assetDecimals).toString())
                  .toString(),
                18
              );

              const liquidationBonus =
                parseFloat(
                  userCollateral["reserve"]["reserveLiquidationBonus"]
                ) /
                10 ** 5;

              const maxLiquidationAmountEth =
                parseFloat(totalCollateralInEth) * liquidationBonus;

              //getting debt variables to keep in the final obj

              const totalDebtinEth = parseFloat(
                normalize(userDataOnChain["totalDebtETH"].toString(), 18)
              );

              // filling the final obj
              return {
                user: ethers.utils.getAddress(candidateData["id"]),
                type: "Success",
                liquidationOpportunityEth: maxLiquidationAmountEth,
                totalDebtEth: totalDebtinEth,
                assetCode: userCollateral["reserve"]["symbol"],
                atokenBalance: normalize(
                  userCollateral["scaledATokenBalance"].toString(),
                  18
                ),
                assetAddress: ethers.utils.getAddress(
                  userCollateral["reserve"]["underlyingAsset"]
                ),
                obs: "",
              };
            })
          );

          // chossing the winner asset in eth potential price
          const orderedPotentials = _.orderBy(
            assetPotentials,
            ["liquidationOpportunityEth"],
            ["desc"]
          );

          return orderedPotentials[0];
        } else {
          return {
            user: candidateData["id"],
            type: "Fail",
            liquidationOpportunityEth: 0,
            totalDebtEth: 0,
            asset: "",
            obs: "user no found on DB",
          };
        }
      }
    })
  );
  return scannedCandidates;
}

export default prepareTrades;
