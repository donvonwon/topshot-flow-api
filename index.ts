import * as fcl from "@onflow/fcl";
import { getConfig } from "./config";
import initApp from "./app";
import CursorService from "./services/cursor";
import FlowService from "./services/flow";
import MarketWorker from "./workers/market-worker";
import TopshotWorker from "./workers/topshot-worker";

async function run() {
  const config = getConfig();

  // Set node
  fcl.config().put("accessNode.api", config.accessApi);

  const cursorService = new CursorService();
  const flowService = new FlowService();

  // Run API
  const app = initApp();

  app.listen(config.port, () => {
    console.log(`Listening on port ${config.port}!`);
  });

  // Run market contract workers
  new MarketWorker(config.contracts.Market, cursorService, flowService).run();

  // Run topshot contract workers
  new TopshotWorker(config.contracts.TopShot, cursorService, flowService).run();
}

const redOutput = "\x1b[31m%s\x1b[0m";

run().catch((e) => {
  console.error(redOutput, e);
  process.exit(1);
});
