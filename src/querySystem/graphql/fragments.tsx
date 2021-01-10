import { gql } from "@apollo/client/core";

interface FragmentObject {
  fragment: any;
}

export const UserReserve: FragmentObject = {
  fragment: gql`
    fragment UserReserveData on UserReserve {
      currentATokenBalance
      scaledATokenBalance
      reserve {
        id
        underlyingAsset
        name
        symbol
        decimals
        liquidityRate
        reserveLiquidationBonus
        lastUpdateTimestamp
        aToken {
          id
        }
      }
      usageAsCollateralEnabledOnUser
      stableBorrowRate
      principalStableDebt
      currentVariableDebt
      variableBorrowIndex
      lastUpdateTimestamp
    }
  `,
};

export const ReserveData: FragmentObject = {
  fragment: gql`
    fragment ReserveData on Reserve {
      id
      underlyingAsset
      name
      symbol
      decimals
      isActive
      isFrozen
      usageAsCollateralEnabled
      borrowingEnabled
      stableBorrowRateEnabled
      baseLTVasCollateral
      optimalUtilisationRate
      averageStableRate
      stableRateSlope1
      stableRateSlope2
      baseVariableBorrowRate
      variableRateSlope1
      variableRateSlope2
      liquidityIndex
      reserveLiquidationThreshold
      variableBorrowIndex
      aToken {
        id
      }
      availableLiquidity
      stableBorrowRate
      liquidityRate
      totalPrincipalStableDebt
      totalScaledVariableDebt
      totalCurrentVariableDebt
      totalLiquidity
      utilizationRate
      reserveLiquidationBonus
      variableBorrowRate
      price {
        priceInEth
      }
      lastUpdateTimestamp
    }
  `,
};
