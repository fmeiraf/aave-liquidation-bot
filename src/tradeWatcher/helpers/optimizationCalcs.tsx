import _ from "lodash";
import { ethers, Contract } from "ethers";
import BigNumber from "bignumber.js";

import { normalize } from "../../calcSystem/helpers/pool-math";
import { User, UserReserve } from "../../querySystem/dbTypes";

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

        BigNumber.set({ EXPONENTIAL_AT: 25 }); // avoid scientific notation to prevent erros passing this to onChain calls

        const debtValueForLiquidatation = currentTotalDebt
          .multipliedBy(1.05)
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
          currentTotalDebtRaw: currentTotalDebt.toString(),
          currentTotalDebtEth: parseFloat(currentTotalDebtInEth),
          debtValueForLoan: debtValueForLiquidatation.toString(),
          currentTotalDebtEthRaw: currentTotalDebtInEthRaw,
          collateralCalcData: [
            debtEthPrice,
            userReserve["reserve"]["decimals"],
          ],
          maxRawardInEth:
            parseFloat(currentTotalDebtInEth) * 0.5 * liquidationBonus,
        };
      } else {
        return {
          user: ethers.utils.getAddress(userAddress),
          debtAsset: userReserve["reserve"]["symbol"],
          debtAssetAddress: userReserve["reserve"]["underlyingAsset"],
          currentTotalDebt: 0,
          currentTotalDebtEth: 0,
          debtValueForLoan: "",
          currentTotalDebtEthRaw: 0,
          collateralCalcData: [],
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

export async function getBestCollateral(
  userAddress: string,
  userDataDB: User,
  protocolDataProviderContract: Contract,
  priceOracleContract: Contract,
  uniswapFactoryContract: Contract,
  uniswapRouterContract: Contract,
  currentTotalDebt: any,
  bestDebtAssetAddress: string,
  debtAssetSuppordata: any[]
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

      BigNumber.set({ EXPONENTIAL_AT: 25 }); // avoid scientific notation to prevent erros passing this to onChain calls

      // gathering important variables to be used during calculations

      const collateralBalance = userReserveOnChain["currentATokenBalance"];

      const collateralEthPrice = await priceOracleContract.getAssetPrice(
        ethers.utils.getAddress(userCollateral["reserve"]["underlyingAsset"])
      );

      const liquidationBonus =
        parseFloat(userCollateral["reserve"]["reserveLiquidationBonus"]) /
        10 ** 5;

      // checking uniswap pool existence
      const uniswapPoolCheck = await uniswapFactoryContract.getPair(
        bestDebtAssetAddress,
        userCollateral["reserve"]["underlyingAsset"]
      );

      const nullAddress = "0x0000000000000000000000000000000000000000";
      let finalProfitInCollateralAsset = new BigNumber("0");
      let finalProfitInEth = new BigNumber("0");
      let collateralGainAfterLiq = new BigNumber("0");

      if (uniswapPoolCheck !== nullAddress) {
        // calculating swap from collateral to debt asset to know ow much the profit is
        const premium = new BigNumber(currentTotalDebt)
          .multipliedBy(1.05)
          .multipliedBy(0.0009);

        const amountToBePayed = await new BigNumber(
          currentTotalDebt
        ).multipliedBy(0.5);

        //getting what will be the collateral liquidation target
        const maxCollateralToLiquidate = new BigNumber("0")
          .plus(amountToBePayed.toString())
          .multipliedBy(debtAssetSuppordata[0].toString())
          .multipliedBy(
            new BigNumber("10")
              .pow(userCollateral["reserve"]["decimals"])
              .toString()
          )
          .multipliedBy(liquidationBonus)
          .div(
            new BigNumber("0")
              .plus(collateralEthPrice.toString())
              .multipliedBy(new BigNumber("10").pow(debtAssetSuppordata[1]))
          )
          .multipliedBy(10); //my result is getting one decimal off, probably liquidationBonus problem

        //checking if it's possible to pay 50% given the amount of collateral available
        // if debtAmountNeed < amountToBePayed = with the collateral availabe what we can liquidate is less than 50%

        const collateralAmountTarget = maxCollateralToLiquidate.gt(
          collateralBalance
        )
          ? collateralBalance
          : maxCollateralToLiquidate;

        collateralGainAfterLiq = collateralAmountTarget;

        const debtAmountNeeded = await new BigNumber("0")
          .plus(collateralAmountTarget.toString())
          .multipliedBy(collateralEthPrice.toString())
          .multipliedBy(
            new BigNumber("10").pow(debtAssetSuppordata[1]).toString()
          )
          .div(
            new BigNumber("0")
              .plus(debtAssetSuppordata[0].toString())
              .multipliedBy(
                new BigNumber("10").pow(
                  userCollateral["reserve"]["decimals"].toString()
                )
              )
          )
          .plus(liquidationBonus / 2)
          .div(liquidationBonus * 10)
          .decimalPlaces(0, 1);

        const finalAmountToBePayed = debtAmountNeeded.lt(amountToBePayed)
          ? debtAmountNeeded
          : amountToBePayed;

        const amountNeeded = await new BigNumber("0")
          .plus(finalAmountToBePayed.toString())
          .plus(premium.toString());

        // says how many of collateral will be needed to pay for flash loan debt
        const collateralNeededForSwap = await uniswapRouterContract.getAmountsIn(
          amountNeeded.decimalPlaces(0, 1).toString(),
          [
            ethers.utils.getAddress(
              userCollateral["reserve"]["underlyingAsset"]
            ),
            bestDebtAssetAddress,
          ]
        );

        //after checkings it seems the problem is coming from the uniswap value, it seems higher that what I am seeing in the contrat call

        const finalProfit = new BigNumber("0").plus(
          collateralAmountTarget.minus(collateralNeededForSwap[0].toString())
        );

        finalProfitInCollateralAsset = finalProfit;

        finalProfitInEth = finalProfitInCollateralAsset
          .multipliedBy(collateralEthPrice.toString())
          .div(
            new BigNumber("10")
              .pow(userCollateral["reserve"]["decimals"])
              .toString()
          );
      }

      const finalProfitInEthNorm = normalize(finalProfitInEth, 18);

      return {
        collateralAsset: userCollateral["reserve"]["symbol"],
        collateralAssetAddress: ethers.utils.getAddress(
          userCollateral["reserve"]["underlyingAsset"]
        ),
        collateralPotentialGain: collateralGainAfterLiq.toString(),
        finalProfitInCollateralAsset: finalProfitInCollateralAsset.toString(),
        finalProfitInEth: finalProfitInEth.toString(),
        finalProfitInEthNormalized: parseFloat(finalProfitInEthNorm),
        hasProfit: parseFloat(finalProfitInEthNorm) > 0 ? true : false,
        hasUniswapPool: uniswapPoolCheck !== nullAddress,
      };
    })
  );

  const filteredTrades = _.filter(userCollateralAssetsInEth, {
    hasUniswapPool: true,
    hasProfit: true,
  });

  const winnerCollateralAsset = _.orderBy(
    filteredTrades,
    ["finalProfitInEthNormalized"],
    ["desc"]
  )[0];

  if (winnerCollateralAsset) {
    return { ...winnerCollateralAsset, type: "success" };
  } else {
    type: "fail";
  }

  return winnerCollateralAsset;
}
