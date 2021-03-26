import * as fcl from "@onflow/fcl";
import { getConfig } from "../config";
import CursorService from "../services/cursor";
import FlowService from "../services/flow";
import MarketWorker from "./market-worker";
import TopshotWorker from "./topshot-worker";

// Daemon style worker to run in isolation
// API can integrate this in directly and run in parallel on API initialization

async function run() {
  const config = getConfig();

  // Set node
  fcl.config().put("accessNode.api", config.accessApi);

  const cursorService = new CursorService();
  const flowService = new FlowService();

  // Run market contract workers
  new MarketWorker(config.contracts.Market, cursorService, flowService).run();
  // Run topshot contract workers
  new TopshotWorker(config.contracts.TopShot, cursorService, flowService).run();
}

run().catch((e) => console.error("error", e));
