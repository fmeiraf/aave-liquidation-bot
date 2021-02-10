import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
// import { INFURA_KOVAN } from "../env";

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (args, hre) => {
  console.log(args);
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(await account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
export default {
  solidity: "0.6.12",
  networks: {
    hardhat: {
      forking: {
        url: "https://kovan.infura.io/v3/478245303595403cbe68cac2bf93d93b",
      },
    },
  },
};
