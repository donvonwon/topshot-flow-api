import * as fcl from "@onflow/fcl";
import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { getConfig } from "./config";
import initApp from "./app";
import CursorService from "./services/cursor";
import FlowService from "./services/flow";
import WorkerService from "./services/worker";
import MarketWorker from "./workers/market-worker";
import TopshotWorker from "./workers/topshot-worker";

mongoose.plugin(updateIfCurrentPlugin);

async function run() {
  const config = getConfig();

  // Setup mongob connection
  await mongoose.connect(config.databaseUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log("Established connection with database", config.databaseUrl);

  // Set node
  fcl.config().put("accessNode.api", config.accessApi);

  const cursorService = new CursorService();
  const flowService = new FlowService();
  const workerService = new WorkerService();

  // Run API
  const app = initApp();

  app.listen(config.port, () => {
    console.log(`Listening on port ${config.port}!`);
  });

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

const redOutput = "\x1b[31m%s\x1b[0m";

run().catch((e) => {
  console.error(redOutput, e);
  process.exit(1);
});
