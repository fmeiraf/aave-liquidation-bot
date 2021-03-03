import { findTrades } from "./tradeWatcher";

async function run() {
  const alltrades = await findTrades();
  console.log(alltrades);
}

run();
