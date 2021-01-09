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
