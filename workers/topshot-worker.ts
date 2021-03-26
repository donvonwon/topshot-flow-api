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

  async onEvent(event: any): Promise<void> {
    switch (event.type) {
      default:
        console.log(`Unhandeled event in TopShotWorker: ${event.type}`, event);
    }
  }
}
