import { ethers } from "hardhat";
import abiAddress from "../../ABIs/abiAddress";
import { NETWORK } from "../../env";

const lendingPoolAddressProviderAddress =
  NETWORK === "kovan"
    ? abiAddress["LendingPoolAddressProvider"]["kovan"]
    : abiAddress["LendingPoolAddressProvider"]["kovan"];

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const contract = await ethers.getContractFactory("Liquidator");
  const token = await contract.deploy(lendingPoolAddressProviderAddress);

  console.log("Token address:", token.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
