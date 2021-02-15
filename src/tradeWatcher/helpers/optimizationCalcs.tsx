import _ from "lodash";
import { ethers, Contract } from "ethers";
import BigNumber from "bignumber.js";

import { normalize } from "../../calcSystem/helpers/pool-math";
import { User, UserReserve } from "../../querySystem/dbTypes";
// import { valueToZDBigNumber } from "../../calcSystem/helpers/bignumber";

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

        let currentTotalDebt = new BigNumber("0");
        currentTotalDebt = currentTotalDebt
          .plus(currentStableDebt.toString())
          .plus(currentVariableDebt.toString());

        const debtValueForLiquidatation = currentTotalDebt
          .multipliedBy(1.1)
          .decimalPlaces(0, 1); // to guarantee in the flashLoan call that this will be enough

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
          );

        const liquidationBonus =
          parseFloat(userReserve["reserve"]["reserveLiquidationBonus"]) /
          10 ** 5;

        return {
          user: ethers.utils.getAddress(userAddress),
          debtAsset: userReserve["reserve"]["symbol"],
          debtAssetAddress: ethers.utils.getAddress(
            userReserve["reserve"]["underlyingAsset"]
          ),
          currentTotalDebtEth: parseFloat(currentTotalDebtInEth),
          debtValueForLoan: debtValueForLiquidatation.toString(),
          currentTotalDebtEthRaw: currentTotalDebtInEthRaw,
          maxRawardInEth:
            parseFloat(currentTotalDebtInEth) * 0.5 * liquidationBonus,
        };
      } else {
        return {
          user: ethers.utils.getAddress(userAddress),
          debtAsset: userReserve["reserve"]["symbol"],
          debtAssetAddress: userReserve["reserve"]["underlyingAsset"],
          currentTotalDebtEth: 0,
          debtValueForLoan: "",
          currentTotalDebtEthRaw: 0,
          maxRawardInEth: 0,
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

export async function gestBestCollateral(
  userAddress: string,
  userDataDB: User,
  protocolDataProviderContract: Contract,
  priceOracleContract: Contract,
  debtInEthRaw: any
) {
  const userCollaterals = _.filter(userDataDB["reserves"], {
    usageAsCollateralEnabledOnUser: true,
  });

  const userCollateralAssetsInEth = await Promise.all(
    _.map(userCollaterals, async (userCollateral: UserReserve) => {
      const userReserveOnChain = await protocolDataProviderContract.getUserReserveData(
        ethers.utils.getAddress(userCollateral["reserve"]["underlyingAsset"]),
        ethers.utils.getAddress(userAddress)
      );

      const collateralBalance = userReserveOnChain["currentATokenBalance"];

      const collateralEthPrice = await priceOracleContract.getAssetPrice(
        ethers.utils.getAddress(userCollateral["reserve"]["underlyingAsset"])
      );

      const potentialCollateralGain = debtInEthRaw
        .times(new BigNumber("10").pow(17).times(5).toString())
        .times(
          new BigNumber("10")
            .pow(userCollateral["reserve"]["decimals"])
            .toString()
        )
        .div(
          collateralEthPrice
            .mul(new BigNumber("10").pow(18).toString())
            .toString()
        );

      const liquidationBonus =
        parseFloat(userCollateral["reserve"]["reserveLiquidationBonus"]) /
        10 ** 5;

      const collateralGain =
        parseFloat(
          normalize(
            potentialCollateralGain.toString(),
            userCollateral["reserve"]["decimals"]
          )
        ) * liquidationBonus;

      const collateralNeeded = parseFloat(
        normalize(
          potentialCollateralGain.toString(),
          userCollateral["reserve"]["decimals"]
        )
      );
      const collateralBalanceNormalized = parseFloat(
        normalize(
          collateralBalance.toString(),
          userCollateral["reserve"]["decimals"]
        )
      );

      return {
        collateralAsset: userCollateral["reserve"]["symbol"],
        collateralAssetAddress: ethers.utils.getAddress(
          userCollateral["reserve"]["underlyingAsset"]
        ),
        collateralPotentialGain: collateralGain,
        collateralNeedCoverage: collateralNeeded / collateralBalanceNormalized,
      };
    })
  );

  const winnerCollateralAsset = _.orderBy(
    userCollateralAssetsInEth,
    ["collateralNeedCoverage"],
    ["desc"]
  )[0];

  return winnerCollateralAsset;
}
