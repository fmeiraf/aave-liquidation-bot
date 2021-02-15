import { runQuerySystem } from "../../querySystem/querySystem";
import { findTrades } from "../../tradeWatcher/tradeWatcher";
import chalk from "chalk";
import fs from "fs";

async function prepareTradeFile() {
  console.log(chalk.greenBright("Updating DB data.."));
  await runQuerySystem();

  console.log(chalk.greenBright("Calculating better deals.."));
  const allTrades = await findTrades();
  const bestTrade: any = allTrades[1];

  fs.writeFile(
    "./src/eth/scripts/tradeData.json",
    JSON.stringify(bestTrade),
    (err) => {
      if (err) {
        console.log(err);
      }
      console.log(chalk.magentaBright("File saved."));
    }
  );
}

prepareTradeFile();
