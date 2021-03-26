import * as fcl from "@onflow/fcl";
import { getEventsAtBlockHeightRange, send } from "@onflow/sdk";
import CursorService from "../services/cursor";
import FlowService from "../services/flow";

interface EventDetails {
  blockHeight: number;
}

// BaseEventHandler will iterate through a range of block heights and then run a callback to process any events we
// are interested in. It also keeps track of a cursor in the database so we can resume from where we left off.

abstract class BaseEventHandler {
  private stepSize: number = 1000;
  private stepTimeMs: number = 500;
  private blockThreshold: number = 100;
  private eventName: string = "";
  private logger: any = null;

  protected constructor(
    private readonly config: any,
    private readonly cursorService: CursorService,
    private readonly flowService: FlowService,
    private readonly eventType: string
  ) {
    const address = fcl.sansPrefix(config.address);
    this.eventName = `A.${address}.${config.name}.${eventType}`;
    this.logger = console.log.bind(null, this.eventName);
  }

  async run() {
    this.logger("Fetching latest block height...");

    let latestBlockHeight = await this.flowService.getLatestBlockHeight();

    this.logger("Retrieved latestBlockHeight:", latestBlockHeight);

    // create a cursor on the database
    let blockCursor = await this.cursorService.upsertLatestCursor(
      this.eventName,
      latestBlockHeight
    );

    if (!blockCursor) {
      throw new Error(
        `Invalid state, no block cursor defined for event_name=${this.eventName}`
      );
    }

    // loop
    let fromBlock, toBlock;

    while (true) {
      await this.sleep(this.stepTimeMs);

      try {
        // calculate fromBlock, toBlock
        ({ fromBlock, toBlock } = await this.getBlockRange(blockCursor));
      } catch (e) {
        console.warn("Error retrieving block range");
        continue;
      }

      // Make sure we query the access node only when we have a substantial gap
      // between from and to block ranges; currently if we query the access node
      // when the gap is too narrow, it returns an error.
      const blockDiff = toBlock - fromBlock;

      if (blockDiff < this.blockThreshold) {
        this.logger("Skipping block, blockDiff = ", blockDiff);
        continue;
      }

      // do our processing
      let getEventsResult, eventList;

      try {
        // `getEvents` will retrieve all events of the given type within the block height range supplied.
        // See https://docs.onflow.org/core-contracts/access-api/#geteventsforheightrange
        getEventsResult = await send([
          getEventsAtBlockHeightRange(this.eventName, fromBlock, toBlock),
        ]);
        eventList = await fcl.decode(getEventsResult);
      } catch (e) {
        console.error(
          `error retrieving events for block range fromBlock=${fromBlock} toBlock=${toBlock}`,
          e
        );
        continue;
      }

      for (let i = 0; i < eventList.length; i++) {
        this.logger(
          "Block height =",
          getEventsResult.events[i].blockHeight,
          "Payload =",
          eventList[i].data
        );

        const blockHeight = getEventsResult.events[i].blockHeight;

        await this.processAndCatchEvent(blockHeight, eventList, i);
      }

      // update cursor
      blockCursor = await this.cursorService.updateCursorById(
        blockCursor.id,
        toBlock
      );
    }
  }

  private async processAndCatchEvent(blockHeight, eventList, i: number) {
    try {
      await this.onEvent({ blockHeight }, eventList[i].data);
    } catch (e) {
      // TODO: Handle event error gracefully
      console.error(`Error processing event block_height=${blockHeight}`, e);
    }
  }

  abstract onEvent(details: EventDetails, payload: any): Promise<void>;

  private async getBlockRange(currentBlockCursor) {
    const latestBlockHeight = await this.flowService.getLatestBlockHeight();
    const fromBlock = currentBlockCursor.currentBlockHeight;

    let toBlock = currentBlockCursor.currentBlockHeight + this.stepSize;

    if (toBlock > latestBlockHeight) {
      toBlock = latestBlockHeight;
    }

    this.logger(
      `fromBlock=${fromBlock} toBlock=${toBlock} latestBlock=${latestBlockHeight}`
    );

    return { fromBlock, toBlock };
  }

  private sleep(ms = 5000) {
    return new Promise((resolve, reject) => setTimeout(resolve, ms));
  }
}

export { BaseEventHandler, EventDetails };
