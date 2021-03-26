import CursorService from "../services/cursor";
import FlowService from "../services/flow";
import { EventDetails, BaseEventHandler } from "./base";

/**

 pub event MomentListed(id: UInt64, price: UFix64, seller: Address?)

 Emitted when a user lists a Moment for sale in their SaleCollection.

 **/

export default class MarketMomentListed extends BaseEventHandler {
  constructor(config, cursorService: CursorService, flowService: FlowService) {
    super(config, cursorService, flowService, "MomentListed");
  }

  async onEvent(details: EventDetails, payload: any): Promise<void> {
    console.log("Got moment listed event! ", payload);
  }
}
