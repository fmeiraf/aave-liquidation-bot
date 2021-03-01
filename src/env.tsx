import * as dotenv from "dotenv";

dotenv.config({ path: `${__dirname}/.env` });

export const NETWORK: any | string = process.env["NETWORK"];
export const INFURA_KOVAN: any | string = process.env["INFURA_KOVAN"];
export const INFURA_MAINNET: any | string = process.env["INFURA_MAINNET"];
export const ALCHEMY_MAINNET: any | string = process.env["INFURA_MAINNET"];
export const KOVAN_PRIVATE_KEY: any | string = process.env["KOVAN_PRIVATE_KEY"];
