import CursorService from "../services/cursor";
import FlowService from "../services/flow";
import { EventDetails, BaseEventHandler } from "./base";

/**

 pub event Deposit(id: UInt64, to: Address?)

 Emitted when a Moment is deposited into a collection. id refers to the global Moment ID.
 If the collection was in an account's storage when it was deposited, to will show the address of the account that it was deposited to.
 If the collection was not in storage when the Moment was deposited, to will be nil.

 **/

export default class TopShotDeposit extends BaseEventHandler {
  constructor(config, cursorService: CursorService, flowService: FlowService) {
    super(config, cursorService, flowService, "Deposit");
  }

  async onEvent(details: EventDetails, payload: any): Promise<void> {
    console.log("Got Deposit event! ", payload);
  }
}
