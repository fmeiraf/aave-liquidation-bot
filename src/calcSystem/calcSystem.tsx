// import BigNumber from "bignumber.js";
// import { UserReserve } from "../querySystem/dbTypes";

// import {
//   BigNumberValue,
//   valueToBigNumber,
//   valueToZDBigNumber,
// } from "./helpers/bignumber";
// import * as RayMath from "./helpers/ray-math";

// const SECONDS_PER_YEAR = valueToBigNumber("31536000");
// // const ETH_DECIMALS = 18;
// // const USD_DECIMALS = 10;
// // const RAY_DECIMALS = 27;

// const calculateCompoundedInterest = (
//   rate: BigNumberValue,
//   currentTimestamp: number,
//   lastUpdateTimestamp: number
// ): BigNumber => {
//   const timeDelta = valueToZDBigNumber(currentTimestamp - lastUpdateTimestamp);
//   const ratePerSecond = valueToZDBigNumber(rate).dividedBy(SECONDS_PER_YEAR);
//   return RayMath.rayPow(ratePerSecond.plus(RayMath.RAY), timeDelta);
// };

// export const calculateLinearInterest = (
//   rate: BigNumberValue,
//   currentTimestamp: number,
//   lastUpdateTimestamp: number
// ) => {
//   const timeDelta = RayMath.wadToRay(
//     valueToZDBigNumber(currentTimestamp - lastUpdateTimestamp)
//   );
//   const timeDeltaInSeconds = RayMath.rayDiv(
//     timeDelta,
//     RayMath.wadToRay(SECONDS_PER_YEAR)
//   );
//   return RayMath.rayMul(rate, timeDeltaInSeconds).plus(RayMath.RAY);
// };

// export function getCompoundedBorrowBalance(
//   // reserve: ReserveData,
//   userReserve: UserReserve,
//   currentTimestamp: number
// ): BigNumber {
//   const stableDebt = valueToZDBigNumber(userReserve.principalStableDebt);
//   // const variableDebt = valueToZDBigNumber(userReserve.currentVariableDebt);

//   // const principalBorrows = stableDebt.plus(variableDebt);
//   // if (principalBorrows.eq('0')) {
//   //   return valueToZDBigNumber('0');
//   // }
//   // let cumulatedInterest;
//   // if (!variableDebt.eq(0)) {
//   //   let compoundedInterest = calculateCompoundedInterest(
//   //     reserve.variableBorrowRate,
//   //     currentTimestamp,
//   //     reserve.lastUpdateTimestamp
//   //   );

//   //   cumulatedInterest = RayMath.rayDiv(
//   //     RayMath.rayMul(compoundedInterest, reserve.variableBorrowIndex),
//   //     userReserve.variableBorrowIndex
//   //   );
//   // } else {
//   //   // if stable
//   //   cumulatedInterest = calculateCompoundedInterest(
//   //     userReserve.stableBorrowRate,
//   //     currentTimestamp,
//   //     userReserve.lastUpdateTimestamp
//   //   );
//   // }
//   const cumulatedInterest = calculateCompoundedInterest(
//     userReserve.stableBorrowRate,
//     currentTimestamp,
//     userReserve.lastUpdateTimestamp
//   );

//   const borrowBalanceRay = RayMath.wadToRay(stableDebt);

//   console.log(
//     RayMath.rayToWad(RayMath.rayMul(borrowBalanceRay, cumulatedInterest))
//   );
//   return RayMath.rayToWad(RayMath.rayMul(borrowBalanceRay, cumulatedInterest));
// }
