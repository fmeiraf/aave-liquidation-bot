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
  reserve: ReserveData[];
  scaledATokenBalance: string;
  usageAsCollateralEnabledOnUser: boolean;
  scaledVariableDebt: string;
  variableBorrowIndex: string;
  stableBorrowRate: string;
  principalStableDebt: string;
  stableBorrowLastUpdateTimestamp: number;
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
  poolReserves: poolReserve[];
};

export type poolReserve = {
  d: string;
  underlyingAsset: string;
  name: string;
  symbol: string;
  decimals: number;
  isActive: boolean;
  isFrozen: boolean;
  usageAsCollateralEnabled: boolean;
  aTokenAddress: string;
  stableDebtTokenAddress: string;
  variableDebtTokenAddress: string;
  borrowingEnabled: boolean;
  stableBorrowRateEnabled: boolean;
  reserveFactor: string;
  baseLTVasCollateral: string;
  optimalUtilisationRate: string;
  stableRateSlope1: string;
  stableRateSlope2: string;
  averageStableRate: string;
  stableDebtLastUpdateTimestamp: number;
  baseVariableBorrowRate: string;
  variableRateSlope1: string;
  variableRateSlope2: string;
  liquidityIndex: string;
  reserveLiquidationThreshold: string;
  reserveLiquidationBonus: string;
  variableBorrowIndex: string;
  variableBorrowRate: string;
  avg30DaysVariableBorrowRate?: string;
  availableLiquidity: string;
  stableBorrowRate: string;
  liquidityRate: string;
  avg30DaysLiquidityRate?: string;
  totalPrincipalStableDebt: string;
  totalScaledVariableDebt: string;
  lastUpdateTimestamp: number;
  price: {
    priceInEth: string;
  };
};
