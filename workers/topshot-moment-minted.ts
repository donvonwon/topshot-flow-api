import CursorService from "../services/cursor";
import FlowService from "../services/flow";
import { EventDetails, BaseEventHandler } from "./base";

/**

 pub event MomentMinted(momentID: UInt64, playID: UInt32, setID: UInt32, serialNumber: UInt32)

 Emitted when a Moment is minted from a set.
 The momentID is the global unique identifier that differentiates a Moment from all other Top Shot Moments in existence.
 The serialNumber is the identifier that differentiates the Moment within an Edition.
 It corresponds to the place in that edition where it was minted.

 **/

export default class TopShotMomentMinted extends BaseEventHandler {
  constructor(config, cursorService: CursorService, flowService: FlowService) {
    super(config, cursorService, flowService, "MomentMinted");
  }

  async onEvent(details: EventDetails, payload: any): Promise<void> {
    console.log("Got TopShotMomentMinted event! ", payload);
  }
}
