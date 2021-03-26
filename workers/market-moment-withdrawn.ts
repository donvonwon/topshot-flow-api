import CursorService from "../services/cursor";
import FlowService from "../services/flow";
import { EventDetails, BaseEventHandler } from "./base";

/**

 pub event MomentWithdrawn(id: UInt64, owner: Address?)

 Emitted when a seller withdraws their Moment from their SaleCollection.

 **/

export default class MarketMomentWithdrawn extends BaseEventHandler {
  constructor(config, cursorService: CursorService, flowService: FlowService) {
    super(config, cursorService, flowService, "MomentWithdrawn");
  }

  async onEvent(details: EventDetails, payload: any): Promise<void> {
    console.log("Got moment withdrawn event! ", payload);
  }
}
