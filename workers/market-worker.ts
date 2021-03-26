import CursorService from "../services/cursor";
import FlowService from "../services/flow";
import BaseEventHandler from "./base";

const workerEvents = [
  "MomentPurchased",
  "MomentListed",
  "MomentWithdrawn",
  "MomentPriceChanged",
  "CutPercentageChanged",
];

export default class MarketWorker extends BaseEventHandler {
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
