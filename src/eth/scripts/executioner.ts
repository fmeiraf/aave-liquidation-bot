import { ethers } from "hardhat";
import abiAddress from "../../ABIs/abiAddress";
import liquidatorABI from "../artifacts/contracts/Liquidator.sol/Liquidator.json";
import { updateMode } from "../../querySystem/querySystem";
import { INFURA_KOVAN } from "../../env";
import { findTrades } from "../../tradeWatcher/tradeWatcher";

async function execute() {
  await updateMode();

  const provider = new ethers.providers.JsonRpcProvider(INFURA_KOVAN);
  const liquidator = await new ethers.Contract(
    abiAddress["Liquidator"]["kovan"],
    liquidatorABI["abi"],
    provider
  );

  const potentialTrades = await findTrades();
}
