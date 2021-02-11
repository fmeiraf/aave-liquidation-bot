// import { expect } from "chai";
import { ethers } from "hardhat";
// import { Signer } from "ethers";

describe("Liquidator", function () {
  //   let accounts: Signer[];

  //   beforeEach(async () => {
  //     accounts = await ethers.getSigners();
  //   });

  it("Should return address after deployment", async function () {
    const liquidatorArtifacts = await ethers.getContractFactory("Liquidator");
    const liquidator = await liquidatorArtifacts.deploy("foi");

    // console.log(accounts);

    await liquidator.deployed();
    console.log("Liquidator deployed to:", liquidator.address);
  });
});
