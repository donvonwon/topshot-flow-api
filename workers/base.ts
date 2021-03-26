import * as fcl from "@onflow/fcl";
import { getEventsAtBlockHeightRange, send } from "@onflow/sdk";
import { IBlockCursor } from "../models/BlockCursor";
import CursorService from "../services/cursor";
import FlowService from "../services/flow";
import WorkerService from "../services/worker";

// BaseEventHandler will iterate through a range of block heights and then run a callback to process any events we
// are interested in. It also keeps track of a cursor in the database so we can resume from where we left off.

abstract class BaseEventHandler {
  private stepSize: number = 200;
  private stepTimeMs: number = 1000;
  private latestBlockOffset: number = 1;
  private eventNames: string[] = [];

  protected constructor(
    private readonly config: any,
    private readonly cursorService: CursorService,
    private readonly flowService: FlowService,
    private readonly workerService: WorkerService,
    private readonly workerEvents: string[]
  ) {
    const address = fcl.sansPrefix(config.address);

    this.eventNames = workerEvents.map(
      (eventType) => `A.${address}.${config.name}.${eventType}`
    );
  }

  async run() {
    console.log("Fetching latest block height...");

    const latestBlockHeight = await this.flowService.getLatestBlockHeight();

    console.log("Retrieved latestBlockHeight:", latestBlockHeight);
    console.log("Current events being worked", this.eventNames.join(","));

    const cursors = this.eventNames.map((eventName: string) => {
      const cursor = this.cursorService.findOrInsertLatestCursor(
        eventName,
        latestBlockHeight
      );
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

        console.log(
          `${eventName}: from<to ${
            fromBlock <= toBlock
          } fromBlock=${fromBlock} toBlock=${toBlock} latestBlock=${newLatestBlockHeight}`
        );

        if (fromBlock <= toBlock) {
          try {
            const result = await send([
              getEventsAtBlockHeightRange(eventName, fromBlock, toBlock),
            ]);
            const decoded = await fcl.decode(result);

            if (decoded.length) {
              decoded.forEach(async (event) => {
                await this.onEvent(event, {
                  flowService: this.flowService,
                  workerService: this.workerService,
                });
              });
            }

            // Record the last block that we synchronized up to
            blockCursor = (await this.cursorService.updateCursorByEventName(
              eventName,
              toBlock
            )) as IBlockCursor;
          } catch (e) {
            console.error(
              `${eventName}: Error retrieving events for block range fromBlock=${fromBlock} toBlock=${toBlock}`
            );
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
    di: { flowService: FlowService; workerService: WorkerService }
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
