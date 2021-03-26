import CursorService from "../services/cursor";
import FlowService from "../services/flow";
import { EventDetails, BaseEventHandler } from "./base";

/**

 pub event PlayCreated(id: UInt32, metadata: {String:String})

 Emitted when a new play has been created and added to the smart contract by an admin.

 **/

export default class TopShotPlayCreated extends BaseEventHandler {
  constructor(config, cursorService: CursorService, flowService: FlowService) {
    super(config, cursorService, flowService, "PlayCreated");
  }

  async onEvent(details: EventDetails, payload: any): Promise<void> {
    console.log("Got TopShotPlayCreated event! ", payload);
  }
}
