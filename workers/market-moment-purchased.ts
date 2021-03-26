import CursorService from "../services/cursor";
import FlowService from "../services/flow";
import { EventDetails, BaseEventHandler } from "./base";

/**

 pub event MomentPurchased(id: UInt64, price: UFix64, seller: Address?)

 Emitted when a user purchases a Moment that is for sale.

 **/

export default class MarketMomentPurchased extends BaseEventHandler {
  constructor(config, cursorService: CursorService, flowService: FlowService) {
    super(config, cursorService, flowService, "MomentPurchased");
  }

  async onEvent(details: EventDetails, payload: any): Promise<void> {
    console.log("Got moment purchased event! ", payload);
  }
}
