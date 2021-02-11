import * as dotenv from "dotenv";

dotenv.config();

export const NETWORK: any | string = process.env["NETWORK"];
export const INFURA_KOVAN: any | string = process.env["INFURA_KOVAN"];
export const INFURA_MAINNET: any | string = process.env["INFURA_MAINNET"];
