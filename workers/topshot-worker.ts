import CursorService from "../services/cursor";
import FlowService from "../services/flow";
import WorkerService from "../services/worker";
import BaseEventHandler from "./base";
import topshotMomentMintedHandler from "./handlers/topshot-moment-minted";
import topshotDepositHandler from "./handlers/topshot-deposit";
import topshotNewSeriesHandler from "./handlers/topshot-new-series";
import topshotPlayAddedToSetHandler from "./handlers/topshot-play-added-to-set";
import topshotPlayCreatedHandler from "./handlers/topshot-play-created";
import topshotPlayRetiredFromSetHandler from "./handlers/topshot-play-retired-from-set";
import topshotSetCreatedHandler from "./handlers/topshot-set-created";
import topshotSetLockedHandler from "./handlers/topshot-set-locked";
import topshotWithrawHandler from "./handlers/topshot-withdraw";

const workerEvents = [
  "MomentMinted",
  // "Deposit",
  // "NewSeries",
  // "PlayAddedToSet",
  // "PlayCreated",
  // "PlayRetiredFromSet",
  // "SetCreated",
  // "SetLocked",
  // "Withdraw",
];

export default class TopShotWorker extends BaseEventHandler {
  constructor(
    config,
    cursorService: CursorService,
    flowService: FlowService,
    workerService: WorkerService
  ) {
    super(config, cursorService, flowService, workerService, workerEvents);
  }

  async onEvent(event: any, di: any): Promise<void> {
    if (event.type.includes("MomentMinted")) {
      return topshotMomentMintedHandler(event, di);
    } else if (event.type.includes("Deposit")) {
      return topshotDepositHandler(event, di);
    } else if (event.type.includes("NewSeries")) {
      return topshotNewSeriesHandler(event, di);
    } else if (event.type.includes("PlayAddedToSet")) {
      return topshotPlayAddedToSetHandler(event, di);
    } else if (event.type.includes("PlayCreated")) {
      return topshotPlayCreatedHandler(event, di);
    } else if (event.type.includes("PlayRetiredFromSet")) {
      return topshotPlayRetiredFromSetHandler(event, di);
    } else if (event.type.includes("SetCreated")) {
      return topshotSetCreatedHandler(event, di);
    } else if (event.type.includes("SetLocked")) {
      return topshotSetLockedHandler(event, di);
    } else if (event.type.includes("Withdraw")) {
      return topshotWithrawHandler(event, di);
    } else {
      console.log(`Unhandeled event in TopShotWorker: ${event.type}`, event);
    }
  }
}
