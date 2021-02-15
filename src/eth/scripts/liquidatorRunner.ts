import { ethers } from "hardhat";
import dataProviderABI from "../../ABIs/ProtocolDataProvider.json";
import lendingPoolABI from "../../ABIs/LendingPool.json";
import { normalize } from "../../calcSystem/helpers/pool-math";
import abiAdress from "../../ABIs/abiAddress";
import { BigNumber } from "bignumber.js";
import chalk from "chalk";
import tradeData from "./tradeData.json";

// import { Signer, Contract } from "ethers";

async function main() {
  const accounts = await ethers.getSigners();

  // ### deploying liquidator ###
  const liquidatorArtifacts = await ethers.getContractFactory(
    "LiquidatorDebug"
  );
  const Liquidator = await liquidatorArtifacts.deploy(
    "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5"
  );

  await Liquidator.deployed();
  console.log(chalk.magenta("Liquidator deployed to:"), Liquidator.address);

  // ### running the contract liquidation ####
  console.log(chalk.bgMagenta("###Got best trade possible for test"));

  console.log(tradeData);

  // make user checks on chain to see if the fork is getting all the correct numbers

  const dataProviderContract = await ethers.getContractAt(
    dataProviderABI,
    abiAdress["ProtocolDataProvider"]["mainnet"]
  );

  const lendingPoolContract = await ethers.getContractAt(
    lendingPoolABI,
    abiAdress["LendingPool"]["mainnet"]
  );

  //check health factor
  const userAccountDataChain = await lendingPoolContract.getUserAccountData(
    tradeData.user
  );

  const healthFactorChain = normalize(
    userAccountDataChain.healthFactor.toString(),
    18
  );

  console.log(
    chalk.greenBright(`Health Factor on chain: ${healthFactorChain}`)
  );

  //check debt value
  const userDebtChain = await dataProviderContract.getUserReserveData(
    tradeData.debtAssetAddress,
    tradeData.user
  );

  const userTotalDebtChain = new BigNumber("0")
    .plus(userDebtChain.currentStableDebt.toString())
    .plus(userDebtChain.currentVariableDebt.toString());

  console.log(
    chalk.greenBright(
      `Total debt for this token on chain: ${userTotalDebtChain}`
    )
  );

  // ##starting profit checks and executing the contract

  const tokenCollateralContract = await ethers.getContractAt(
    "IERC20",
    tradeData.collateralAssetAddress
  );

  const tokenDebtContract = await ethers.getContractAt(
    "IERC20",
    tradeData.debtAssetAddress
  );

  const initialCollateralTokenBalance = await tokenCollateralContract.balanceOf(
    accounts[0].getAddress()
  );

  const initialDebtTokenBalance = await tokenDebtContract.balanceOf(
    accounts[0].getAddress()
  );

  console.log(chalk.bgMagenta("###START Contract console.logs.."));
  await Liquidator.callFlashLoan(
    tradeData.debtAssetAddress,
    tradeData.collateralAssetAddress,
    tradeData.user,
    tradeData.debtValueForLoan
  );
  console.log(chalk.bgMagenta("###END Contract console.logs.."));

  const finalCollateralTokenBalance = await tokenCollateralContract.balanceOf(
    accounts[0].getAddress()
  );

  const finalDebtTokenBalance = await tokenDebtContract.balanceOf(
    accounts[0].getAddress()
  );

  console.log(
    chalk.greenBright(
      `Initial Balance: ${initialCollateralTokenBalance}. Final Balance: ${finalCollateralTokenBalance}`
    )
  );

  console.log(
    chalk.greenBright(
      `Initial Balance: ${initialDebtTokenBalance}. Final Balance: ${finalDebtTokenBalance}`
    )
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
