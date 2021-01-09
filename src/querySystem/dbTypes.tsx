export type ReserveData = {
  id: string;
  underlyingAsset: number;
  name: string;
  symbol: string;
  decimals: number;
  liquidityRate: number;
  reserveLiquidationBonus: number;
  lastUpdateTimestamp: number;
  aToken: {
    id: string;
  };
};

export type UserReserve = {
  currentATokenBalance: number;
  scaledATokenBalance: number;
  reserve: ReserveData[];
  usageAsCollateralEnabledOnUser: boolean;
  stableBorrowRate: number;
  principalStableDebt: number;
  currentVariableDebt: number;
  variableBorrowIndex: number;
  lastUpdateTimestamp: number;
};

export type User = {
  address: string;
  reserves: UserReserve[];
};

export type lastEventTimestamp = {
  eventName: string;
  timestamp: number;
};

export type Schema = {
  users: User[];
  lastEventTimestamps: lastEventTimestamp[];
};
