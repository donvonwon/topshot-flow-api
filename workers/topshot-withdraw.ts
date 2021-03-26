import CursorService from "../services/cursor";
import FlowService from "../services/flow";
import { EventDetails, BaseEventHandler } from "./base";

/**

 pub event Withdraw(id: UInt64, from: Address?)

 Emitted when a Moment is withdrawn from a collection. id refers to the global Moment ID.
 If the collection was in an account's storage when it was withdrawn, from will show the address of the account that it was withdrawn from.
 If the collection was not in storage when the Moment was withdrawn, from will be nil.

 **/

export default class TopShotWithdraw extends BaseEventHandler {
  constructor(config, cursorService: CursorService, flowService: FlowService) {
    super(config, cursorService, flowService, "Withdraw");
  }

  async onEvent(details: EventDetails, payload: any): Promise<void> {
    console.log("Got Withdraw event! ", payload);
  }
}
