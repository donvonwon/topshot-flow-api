import * as fcl from "@onflow/fcl";
import { getEventsAtBlockHeightRange, send } from "@onflow/sdk";
import { IBlockCursor } from "../models/BlockCursor";
import CursorService from "../services/cursor";
import FlowService from "../services/flow";
import EventService from "../services/event";

// BaseEventHandler will iterate through a range of block heights and then run a callback to process any events we
// are interested in. It also keeps track of a cursor in the database so we can resume from where we left off.

abstract class BaseEventHandler {
  private stepSize: number = 250;
  private stepTimeMs: number = 3250; // Avg block time - https://flow.bigdipper.live/
  private latestBlockOffset: number = 3;
  private eventNames: string[] = [];

  protected constructor(
    private readonly config: any,
    private readonly cursorService: CursorService,
    private readonly flowService: FlowService,
    private readonly eventService: EventService,
    private readonly workerEvents: string[]
  ) {
    const address = fcl.sansPrefix(config.address);

    this.eventNames = workerEvents.map((eventType) => `A.${address}.${config.name}.${eventType}`);
  }

  async run() {
    console.log("Fetching latest block height...");

    const latestBlockHeight = await this.flowService.getLatestBlockHeight();

    console.log("Retrieved latestBlockHeight:", latestBlockHeight);
    console.log("Current events being worked", this.eventNames.join(","));

    const cursors = this.eventNames.map((eventName: string) => {
      const cursor = this.cursorService.findOrInsertLatestCursor(eventName, latestBlockHeight);
      return { cursor, eventName };
    });

    if (!cursors || !cursors.length) {
      throw new Error("Could not get block cursor.");
    }

    // Iterate thru cursors across all the events for the given `latestBlockHeight`
    cursors.forEach(async ({ cursor, eventName }) => {
      let blockCursor = await cursor;

      const poller = async () => {
        let fromBlock, toBlock, newLatestBlockHeight;

        try {
          // Calculate block range to search
          ({
            fromBlock,
            toBlock,
            latestBlockHeight: newLatestBlockHeight,
          } = await this.getBlockRange(blockCursor));
        } catch (e) {
          console.warn(`${eventName}: Error retrieving block range:`, e);
        }

        console.log(`${eventName}: from=${fromBlock} to=${toBlock} latest=${newLatestBlockHeight}`);

        if (fromBlock <= toBlock) {
          try {
            const result = await send([getEventsAtBlockHeightRange(eventName, fromBlock, toBlock)]);
            const decoded = await fcl.decode(result);

            if (decoded.length) {
              await Promise.all(
                decoded.map((event) =>
                  this.onEvent(event, {
                    flowService: this.flowService,
                    eventService: this.eventService,
                  })
                )
              );
            }
          } catch (e) {
            console.error(`${eventName}: Error retrieving events from=${fromBlock} to=${toBlock}`);
          } finally {
            // Record the last block that we synchronized up to
            blockCursor = (await this.cursorService.updateCursorByEventName(
              eventName,
              toBlock
            )) as IBlockCursor;
          }
        }

        setTimeout(poller, this.stepTimeMs);
      };

      // Start poller
      poller();
    });
  }

  abstract onEvent(
    event: any,
    di: { flowService: FlowService; eventService: EventService }
  ): Promise<void>;

  private async getBlockRange(currentBlockCursor) {
    const latestBlockHeight =
      (await this.flowService.getLatestBlockHeight()) - this.latestBlockOffset;

    const fromBlock = currentBlockCursor.currentBlockHeight + 1;
    let toBlock = currentBlockCursor.currentBlockHeight + this.stepSize;

    // Keep events scope to the sealed blocks
    if (toBlock > latestBlockHeight) {
      toBlock = latestBlockHeight;
    }

    return { fromBlock, toBlock, latestBlockHeight };
  }
}

export default BaseEventHandler;
