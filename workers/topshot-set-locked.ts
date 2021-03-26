import CursorService from "../services/cursor";
import FlowService from "../services/flow";
import { EventDetails, BaseEventHandler } from "./base";

/**

 pub event SetLocked(setID: UInt32)

 Emitted when a set is locked, meaning plays cannot be added.

 **/

export default class TopShotSetLocked extends BaseEventHandler {
  constructor(config, cursorService: CursorService, flowService: FlowService) {
    super(config, cursorService, flowService, "SetLocked");
  }

  async onEvent(details: EventDetails, payload: any): Promise<void> {
    console.log("Got SetLocked event! ", payload);
  }
}
