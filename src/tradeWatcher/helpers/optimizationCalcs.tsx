import _ from "lodash";
import { ethers, Contract } from "ethers";
import BigNumber from "bignumber.js";

import { normalize } from "../../calcSystem/helpers/pool-math";
import { User, UserReserve } from "../../querySystem/dbTypes";
import { valueToBigNumber } from "../../calcSystem/helpers/bignumber";

export async function getBestDebtAsset(
  userAddress: string,
  userDataDB: User,
  protocolDataProviderContract: Contract,
  priceOracleContract: Contract
) {
  // select best debt asset considering its equivalent in ETH

  const userReserves = userDataDB["reserves"];

  const userDebtAssetsInEth = await Promise.all(
    _.map(userReserves, async (userReserve: UserReserve) => {
      if (
        userReserve["principalStableDebt"] !== "0" ||
        userReserve["scaledVariableDebt"] !== "0"
      ) {
        const userReserveOnChain = await protocolDataProviderContract.getUserReserveData(
          ethers.utils.getAddress(userReserve["reserve"]["underlyingAsset"]),
          ethers.utils.getAddress(userAddress)
        );

        const currentStableDebt = await userReserveOnChain["currentStableDebt"];
        const currentVariableDebt = await userReserveOnChain[
          "currentVariableDebt"
        ];

        let currentTotalDebt = valueToBigNumber("0");
        currentTotalDebt = currentTotalDebt
          .plus(currentStableDebt.toString())
          .plus(currentVariableDebt.toString());

        const debtEthPrice = await priceOracleContract.getAssetPrice(
          ethers.utils.getAddress(userReserve["reserve"]["underlyingAsset"])
        );

        const currentTotalDebtInEth = await normalize(
          currentTotalDebt
            .multipliedBy(debtEthPrice.toString())
            .div(
              new BigNumber("10")
                .pow(userReserve["reserve"]["decimals"])
                .toString()
            )
            .toString(),
          18
        );

        const currentTotalDebtInEthRaw = await currentTotalDebt
          .multipliedBy(debtEthPrice.toString())
          .div(
            new BigNumber("10")
              .pow(userReserve["reserve"]["decimals"])
              .toString()
          )
          .toString();

        return {
          user: ethers.utils.getAddress(userAddress),
          asset: userReserve["reserve"]["symbol"],
          assetAddress: ethers.utils.getAddress(
            userReserve["reserve"]["underlyingAsset"]
          ),
          currentTotalDebtEth: parseFloat(currentTotalDebtInEth),
          currentTotalDebtEthRaw: currentTotalDebtInEthRaw,
        };
      } else {
        return {
          user: ethers.utils.getAddress(userAddress),
          asset: userReserve["reserve"]["symbol"],
          assetAddress: userReserve["reserve"]["underlyingAsset"],
          currentTotalDebtEth: 0,
        };
      }
    })
  );

  const winnerDebtAsset = _.orderBy(
    userDebtAssetsInEth,
    ["currentTotalDebtEth"],
    ["desc"]
  )[0];

  return winnerDebtAsset;
}
