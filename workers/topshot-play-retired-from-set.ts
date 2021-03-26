import CursorService from "../services/cursor";
import FlowService from "../services/flow";
import { EventDetails, BaseEventHandler } from "./base";

/**

 pub event PlayRetiredFromSet(setID: UInt32, playID: UInt32, numMoments: UInt32)

 Emitted when a play is retired from a set.
 Indicates that that play/set combination and cannot be used to mint moments any more.

 **/

export default class TopShotPlayRetiredFromSet extends BaseEventHandler {
  constructor(config, cursorService: CursorService, flowService: FlowService) {
    super(config, cursorService, flowService, "PlayRetiredFromSet");
  }

  async onEvent(details: EventDetails, payload: any): Promise<void> {
    console.log("Got PlayRetiredFromSet event! ", payload);
  }
}
