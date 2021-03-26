import CursorService from "../services/cursor";
import FlowService from "../services/flow";
import { EventDetails, BaseEventHandler } from "./base";

/**

 pub event PlayAddedToSet(setID: UInt32, playID: UInt32)

 Emitted when a new play is added to a set.

 **/

export default class TopShotPlayAddedToSet extends BaseEventHandler {
  constructor(config, cursorService: CursorService, flowService: FlowService) {
    super(config, cursorService, flowService, "PlayAddedToSet");
  }

  async onEvent(details: EventDetails, payload: any): Promise<void> {
    console.log("Got PlayAddedToSet event! ", payload);
  }
}
