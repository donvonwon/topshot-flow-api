import * as fcl from "@onflow/fcl";
import { getConfig } from "../config";
import CursorService from "../services/cursor";
import FlowService from "../services/flow";
// Market Contract Events
import MarketMomentPurchasedWorker from "./market-moment-purchased";
import MarketMomentListedWorker from "./market-moment-listed";
import MarketMomentPriceChangedWorker from "./market-moment-price-changed";
import MarketMomentWithdrawnWorker from "./market-moment-withdrawn";
import MarketCutPercentageWorker from "./market-cut-percentage-change";
// TopShot Contract Events
import TopShotDepositWorker from "./topshot-deposit";
import TopShotMomentMintedWorker from "./topshot-moment-minted";
import TopShotNewSeriesWorker from "./topshot-new-series";
import TopShotPlayAddedToSetWorker from "./topshot-play-added-to-set";
import TopShotPlayCreatedWorker from "./topshot-play-created";
import TopShotPlayRetiredFromSetWorker from "./topshot-play-retired-from-set";
import TopShotSetCreatedWorker from "./topshot-set-created";
import TopShotSetLockedWorker from "./topshot-set-locked";
import TopShotWithdrawWorker from "./topshot-withdraw";

// Daemon style worker to run in isolation
// API can integrate this in directly and run in parallel on API initialization

async function run() {
  const config = getConfig();

  // Set node
  fcl.config().put("accessNode.api", config.accessApi);

  const cursorService = new CursorService();
  const flowService = new FlowService();

  // Run market contract workers
  await new MarketMomentPurchasedWorker(
    config.contracts.Market,
    cursorService,
    flowService
  ).run();

  await new MarketMomentListedWorker(
    config.contracts.Market,
    cursorService,
    flowService
  ).run();

  await new MarketMomentPriceChangedWorker(
    config.contracts.Market,
    cursorService,
    flowService
  ).run();

  await new MarketMomentWithdrawnWorker(
    config.contracts.Market,
    cursorService,
    flowService
  ).run();

  await new MarketCutPercentageWorker(
    config.contracts.Market,
    cursorService,
    flowService
  ).run();

  // Run topshot contract workers
  await new TopShotDepositWorker(
    config.contracts.TopShot,
    cursorService,
    flowService
  ).run();

  await new TopShotMomentMintedWorker(
    config.contracts.TopShot,
    cursorService,
    flowService
  ).run();

  await new TopShotNewSeriesWorker(
    config.contracts.TopShot,
    cursorService,
    flowService
  ).run();

  await new TopShotPlayAddedToSetWorker(
    config.contracts.TopShot,
    cursorService,
    flowService
  ).run();

  await new TopShotPlayCreatedWorker(
    config.contracts.TopShot,
    cursorService,
    flowService
  ).run();

  await new TopShotPlayRetiredFromSetWorker(
    config.contracts.TopShot,
    cursorService,
    flowService
  ).run();

  await new TopShotSetCreatedWorker(
    config.contracts.TopShot,
    cursorService,
    flowService
  ).run();

  await new TopShotSetLockedWorker(
    config.contracts.TopShot,
    cursorService,
    flowService
  ).run();

  await new TopShotWithdrawWorker(
    config.contracts.TopShot,
    cursorService,
    flowService
  ).run();
}

run().catch((e) => console.error("error", e));
