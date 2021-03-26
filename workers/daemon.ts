import * as fcl from "@onflow/fcl";
import { connect } from "mongoose";
import { getConfig } from "../config";
import CursorService from "../services/cursor";
import FlowService from "../services/flow";
import WorkerService from "../services/worker";
import MarketWorker from "./market-worker";
import TopshotWorker from "./topshot-worker";

// Daemon style worker to run in isolation
// API can integrate this in directly and run in parallel on API initialization

async function run() {
  const config = getConfig();

  // Setup mongob connection
  await connect(config.databaseUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log("Established connection with database", config.databaseUrl);

  // Set node
  fcl.config().put("accessNode.api", config.accessApi);

  const cursorService = new CursorService();
  const flowService = new FlowService();
  const workerService = new WorkerService();

  // Run market contract workers
  new MarketWorker(
    config.contracts.Market,
    cursorService,
    flowService,
    workerService
  ).run();

  // Run topshot contract workers
  new TopshotWorker(
    config.contracts.TopShot,
    cursorService,
    flowService,
    workerService
  ).run();
}

run().catch((e) => console.error("error", e));
