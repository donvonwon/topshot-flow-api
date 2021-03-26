import * as fcl from "@onflow/fcl";
import { getConfig } from "./config";
import initApp from "./app";
import CursorService from "./services/cursor";
import FlowService from "./services/flow";
import TopShotSetLockedWorker from "./workers/topshot-set-locked";
import MarketMomentPriceChangedWorker from "./workers/market-moment-price-changed";
import MarketMomentWithdrawnWorker from "./workers/market-moment-withdrawn";
import TopShotDepositWorker from "./workers/topshot-deposit";
import TopShotPlayAddedToSetWorker from "./workers/topshot-play-added-to-set";
import MarketMomentListedWorker from "./workers/market-moment-listed";
import MarketCutPercentageWorker from "./workers/market-cut-percentage-change";
import TopShotMomentMintedWorker from "./workers/topshot-moment-minted";
import TopShotNewSeriesWorker from "./workers/topshot-new-series";
import TopShotPlayCreatedWorker from "./workers/topshot-play-created";
import TopShotSetCreatedWorker from "./workers/topshot-set-created";
import TopShotWithdrawWorker from "./workers/topshot-withdraw";
import TopShotPlayRetiredFromSetWorker from "./workers/topshot-play-retired-from-set";
import MarketMomentPurchasedWorker from "./workers/market-moment-purchased";

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
  new MarketMomentPurchasedWorker(
    config.contracts.Market,
    cursorService,
    flowService
  ).run();

  new MarketMomentListedWorker(
    config.contracts.Market,
    cursorService,
    flowService
  ).run();

  new MarketMomentPriceChangedWorker(
    config.contracts.Market,
    cursorService,
    flowService
  ).run();

  new MarketMomentWithdrawnWorker(
    config.contracts.Market,
    cursorService,
    flowService
  ).run();

  new MarketCutPercentageWorker(
    config.contracts.Market,
    cursorService,
    flowService
  ).run();

  // Run topshot contract workers
  new TopShotDepositWorker(
    config.contracts.TopShot,
    cursorService,
    flowService
  ).run();

  new TopShotMomentMintedWorker(
    config.contracts.TopShot,
    cursorService,
    flowService
  ).run();

  new TopShotNewSeriesWorker(
    config.contracts.TopShot,
    cursorService,
    flowService
  ).run();

  new TopShotPlayAddedToSetWorker(
    config.contracts.TopShot,
    cursorService,
    flowService
  ).run();

  new TopShotPlayCreatedWorker(
    config.contracts.TopShot,
    cursorService,
    flowService
  ).run();

  new TopShotPlayRetiredFromSetWorker(
    config.contracts.TopShot,
    cursorService,
    flowService
  ).run();

  new TopShotSetCreatedWorker(
    config.contracts.TopShot,
    cursorService,
    flowService
  ).run();

  new TopShotSetLockedWorker(
    config.contracts.TopShot,
    cursorService,
    flowService
  ).run();

  new TopShotWithdrawWorker(
    config.contracts.TopShot,
    cursorService,
    flowService
  ).run();
}

const redOutput = "\x1b[31m%s\x1b[0m";

run().catch((e) => {
  console.error(redOutput, e);
  process.exit(1);
});
