import CursorService from "../services/cursor";
import FlowService from "../services/flow";
import { EventDetails, BaseEventHandler } from "./base";

/**

 pub event SetCreated(setID: UInt32, series: UInt32)

 Emitted when a new set is created.

 **/

export default class TopShotSetCreated extends BaseEventHandler {
  constructor(config, cursorService: CursorService, flowService: FlowService) {
    super(config, cursorService, flowService, "SetCreated");
  }

  async onEvent(details: EventDetails, payload: any): Promise<void> {
    console.log("Got SetCreated event! ", payload);
  }
}
