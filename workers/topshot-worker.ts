import CursorService from "../services/cursor";
import FlowService from "../services/flow";
import BaseEventHandler from "./base";

const workerEvents = [
  "MomentMinted",
  "Deposit",
  "NewSeries",
  "PlayAddedToSet",
  "PlayCreated",
  "PlayRetiredFromSet",
  "SetCreated",
  "SetLocked",
  "Withdraw",
];

export default class TopShotWorker extends BaseEventHandler {
  constructor(config, cursorService: CursorService, flowService: FlowService) {
    super(config, cursorService, flowService, workerEvents);
  }

  async onEvent(event: any, di: any): Promise<void> {
    if (event.type.includes("MomentMinted")) {
    } else if (event.type.includes("Deposit")) {
    } else if (event.type.includes("NewSeries")) {
    } else if (event.type.includes("PlayAddedToSet")) {
    } else if (event.type.includes("PlayCreated")) {
    } else if (event.type.includes("PlayRetiredFromSet")) {
    } else if (event.type.includes("SetCreated")) {
    } else if (event.type.includes("SetLocked")) {
    } else if (event.type.includes("Withdraw")) {
    } else {
      console.log(`Unhandeled event in TopShotWorker: ${event.type}`, event);
    }
  }
}
