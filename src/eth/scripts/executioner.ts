import { ethers } from "ethers";
import abiAddress from "../../ABIs/abiAddress";
import liquidatorABI from "../artifacts/contracts/Liquidator.sol/Liquidator.json";
import { updateMode } from "../../querySystem/querySystem";
import { INFURA_KOVAN, KOVAN_PRIVATE_KEY } from "../../env";
import { findTrades } from "../../tradeWatcher/tradeWatcher";
import { BigNumber } from "bignumber.js";

async function execute() {
  //updating data to get the best trades possible
  await updateMode();

  //loading chain intances
  const provider = new ethers.providers.JsonRpcProvider(INFURA_KOVAN);
  const wallet = new ethers.Wallet(KOVAN_PRIVATE_KEY, provider);
  const liquidator = await new ethers.Contract(
    abiAddress["Liquidator"]["kovan"],
    liquidatorABI["abi"],
    wallet
  );
  console.log(`liquidator address: ${liquidator.address}`);

  const potentialTrades: any[] = await findTrades();

  // estimating gas
  const bestTrade = potentialTrades[0];
  console.log("This is the best trade:", bestTrade);

  const gasEstimate = await liquidator.estimateGas.callFlashLoan(
    bestTrade["debtAssetAddress"],
    bestTrade["collateralAssetAddress"],
    bestTrade["user"],
    bestTrade["debtValueForLoan"]
  );

  const currentGasPrice = await wallet.getGasPrice();

  console.log(
    `Gas estimate for transaction: ${parseInt(gasEstimate.toString())}`
  );
  console.log(`Current Gas Price is: ${parseInt(currentGasPrice.toString())}`);

  //calculating profit after gas
  const totalGasCost = new BigNumber("0")
    .plus(currentGasPrice.toString())
    .multipliedBy(gasEstimate.toString())
    .div(10 ** 18);

  console.log(`Total gas cost is: ${totalGasCost.toString()}`);

  const profitAfterGas =
    bestTrade["finalProfitInEthNormalized"] -
    parseFloat(totalGasCost.toString());

  console.log(`Final profit in ETH should be around: ${profitAfterGas}`);

  //calling function
  if (profitAfterGas > 0) {
    const sentTransaction = await liquidator.callFlashLoan(
      bestTrade["debtAssetAddress"],
      bestTrade["collateralAssetAddress"],
      bestTrade["user"],
      bestTrade["debtValueForLoan"]
    );

    console.log("Transaction SENT!", sentTransaction);
  }

  console.log("FIM.");
}
execute();
