import { ethers } from "ethers";
import { INFURA_KOVAN } from "../../../env";
import abiAddress from "../../../ABIs/abiAddress";
import ProtocolDAtaProviderABI from "../../../ABIs/ProtocolDataProvider.json";

//addresses
export const daiAddress = "0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD";
export const daiAddressLower = "0xff795577d9ac8bd7d90ee22b6c1703490b6512fd";
export const testAddressLower = "0xaea2df19506ea7bc1b3aa82f29a3115c77f0c21e";

//configs

const provider = new ethers.providers.JsonRpcProvider(INFURA_KOVAN);

export const protocolDataProvider = new ethers.Contract(
  abiAddress["ProtocolDataProvider"]["kovan"],
  ProtocolDAtaProviderABI,
  provider
);
