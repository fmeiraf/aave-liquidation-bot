// import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer, Contract } from "ethers";

// import { runQuerySystem } from "../../querySystem/querySystem";
// import { findTrades } from "../../tradeWatcher/tradeWatcher";

let accounts: Signer[];
let Liquidator: Contract;
// let potentialTrades: any[];

beforeEach(async () => {
  accounts = await ethers.getSigners();

  // deployinh liquidator
  const liquidatorArtifacts = await ethers.getContractFactory("Liquidator");
  Liquidator = await liquidatorArtifacts.deploy(
    "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5"
  );

  await Liquidator.deployed();
  // liquidator = Liquidator;
  console.log("Liquidator deployed to:", Liquidator.address);

  //get potential trades
  // runQuerySystem(); // update db
  // potentialTrades = await findTrades();
});

describe("Liquidator", function () {
  it("Testing liquidation call.", async function () {
    const tradeData = {
      user: "0x6d84264A7bD2Cffa4A117BA2350403b3A9866949",
      debtAsset: "WETH",
      debtAssetAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      currentTotalDebtEth: 4.763945786728398,
      debtValueForLoan: "5240340365401236987",
      // currentTotalDebtEthRaw: BigNumber { s: 1, e: 18, c: [Array] },
      // maxRawardInEth: 0.2501071538032409,
      // collateralAsset: 'USDC',
      collateralAssetAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      // collateralPotentialGain: 453.10671609797726,
      // collateralNeedCoverage: 1.6128156203601016,
      // type: 'sucess'
    };

    const tokenContract = await ethers.getContractAt(
      "IERC20",
      tradeData.collateralAssetAddress
    );

    const initialBalance = await tokenContract.balanceOf(
      accounts[0].getAddress()
    );

    console.log(initialBalance.toString());

    await Liquidator.callFlashLoan(
      tradeData.debtAssetAddress,
      tradeData.collateralAssetAddress,
      tradeData.user,
      tradeData.debtValueForLoan
    );

    const finalBalance = await tokenContract.balanceOf(
      accounts[0].getAddress()
    );

    console.log(
      `Initial Balance: ${initialBalance}. Final Balance: ${finalBalance}`
    );
  });
});
