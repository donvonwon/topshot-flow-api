import CursorService from "../services/cursor";
import FlowService from "../services/flow";
import EventService from "../services/event";
import BaseEventHandler from "./base";
import momentPurchasedHandler from "./handlers/market-moment-purchased";
import momentListedHandler from "./handlers/market-moment-listed";
import momentWithdrawnHandler from "./handlers/market-moment-withdrawn";
import momentPriceChangedHandler from "./handlers/market-moment-price-changed";
import cutPercentageChangeHandler from "./handlers/market-cut-percentage-change";

const workerEvents = [
  "MomentPurchased",
  "MomentListed",
  // "MomentWithdrawn",
  // "MomentPriceChanged",
  // "CutPercentageChanged",
];

export default class MarketWorker extends BaseEventHandler {
  constructor(
    config,
    cursorService: CursorService,
    flowService: FlowService,
    eventService: EventService
  ) {
    super(config, cursorService, flowService, eventService, workerEvents);
  }

  async onEvent(event: any, di: any): Promise<void> {
    if (event.type.includes("MomentPurchased")) {
      return momentPurchasedHandler(event, di);
    } else if (event.type.includes("MomentListed")) {
      return momentListedHandler(event, di);
    } else if (event.type.includes("MomentWithdrawn")) {
      return momentWithdrawnHandler(event, di);
    } else if (event.type.includes("MomentPriceChanged")) {
      return momentPriceChangedHandler(event, di);
    } else if (event.type.includes("CutPercentageChanged")) {
      return cutPercentageChangeHandler(event, di);
    } else {
      console.warn(`Unhandeled event in MarketWorker: ${event.type}`, event);
    }
  }
}
