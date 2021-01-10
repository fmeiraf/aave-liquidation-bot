export type ReserveData = {
  __typename: string;
  id: string;
  underlyingAsset: string;
  name: string;
  symbol: string;
  decimals: number;
  liquidityRate: string;
  reserveLiquidationBonus: string;
  lastUpdateTimestamp: number;
  aToken: {
    __typename: string;
    id: string;
  };
};

export type UserReserve = {
  __typename: string;
  currentATokenBalance: number;
  scaledATokenBalance: number;
  reserve: ReserveData[];
  usageAsCollateralEnabledOnUser: boolean;
  stableBorrowRate: string;
  principalStableDebt: string;
  currentVariableDebt: string;
  variableBorrowIndex: string;
  lastUpdateTimestamp: number;
};

export type User = {
  __typename: string;
  id: string;
  reserves: UserReserve[];
};

export type lastEventTimestamp = {
  eventName: number;
  timestamp: number;
};

export type Schema = {
  users: User[];
  lastEventTimestamps: lastEventTimestamp[];
};

export type poolReserve = {
  id: string;
  underlyingAsset: string;
  name: string;
  symbol: string;
  decimals: number;
  isActive: boolean;
  isFrozen: boolean;
  usageAsCollateralEnabled: boolean;
  borrowingEnabled: boolean;
  stableBorrowRateEnabled: boolean;
  baseLTVasCollateral: string;
  optimalUtilisationRate: string;
  averageStableRate: string;
  stableRateSlope1: string;
  stableRateSlope2: string;
  baseVariableBorrowRate: string;
  variableRateSlope1: string;
  variableRateSlope2: string;
  liquidityIndex: string;
  reserveLiquidationThreshold: string;
  variableBorrowIndex: string;
  aToken: {
    __typename: string;
    id: string;
  };
  availableLiquidity: string;
  stableBorrowRate: string;
  liquidityRate: string;
  totalPrincipalStableDebt: string;
  totalScaledVariableDebt: string;
  totalCurrentVariableDebt: string;
  totalLiquidity: string;
  utilizationRate: string;
  reserveLiquidationBonus: string;
  variableBorrowRate: string;
  price: {
    __typename: string;
    priceInEth: string;
  };
  lastUpdateTimestamp: number;
};
