import CursorService from "../services/cursor";
import FlowService from "../services/flow";
import { EventDetails, BaseEventHandler } from "./base";

/**

 pub event NewSeriesStarted(newCurrentSeries: UInt32)

 Emitted when a new series has been triggered by an admin.

 **/

export default class TopShotNewSeriesStarted extends BaseEventHandler {
  constructor(config, cursorService: CursorService, flowService: FlowService) {
    super(config, cursorService, flowService, "NewSeriesStarted");
  }

  async onEvent(details: EventDetails, payload: any): Promise<void> {
    console.log("Got NewSeriesStarted event! ", payload);
  }
}
