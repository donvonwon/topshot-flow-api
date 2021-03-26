import CursorService from "../services/cursor";
import FlowService from "../services/flow";
import { EventDetails, BaseEventHandler } from "./base";

/**

 pub event CutPercentageChanged(newPercent: UFix64, seller: Address?)

 Emitted when a seller changes the percentage cut that is taken from their sales and sent to a beneficiary.

 **/

export default class MarketCutPercentageChanged extends BaseEventHandler {
  constructor(config, cursorService: CursorService, flowService: FlowService) {
    super(config, cursorService, flowService, "CutPercentageChanged");
  }

  async onEvent(details: EventDetails, payload: any): Promise<void> {
    console.log("Got CutPercentageChanged event! ", payload);
  }
}
