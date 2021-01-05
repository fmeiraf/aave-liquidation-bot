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
