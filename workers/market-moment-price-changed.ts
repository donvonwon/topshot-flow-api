import CursorService from "../services/cursor";
import FlowService from "../services/flow";
import { EventDetails, BaseEventHandler } from "./base";

/**

 pub event MomentPriceChanged(id: UInt64, newPrice: UFix64, seller: Address?)

 Emitted when a user changes the price of their Moment.

 **/

export default class MarketMomentPriceChanged extends BaseEventHandler {
  constructor(config, cursorService: CursorService, flowService: FlowService) {
    super(config, cursorService, flowService, "MomentPriceChanged");
  }

  async onEvent(details: EventDetails, payload: any): Promise<void> {
    console.log("Got moment priced changed event! ", payload);
  }
}
