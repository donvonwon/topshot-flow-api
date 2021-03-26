import * as fcl from "@onflow/fcl";
import { getEventsAtBlockHeightRange, send } from "@onflow/sdk";
import CursorService from "../services/cursor";
import FlowService from "../services/flow";

// BaseEventHandler will iterate through a range of block heights and then run a callback to process any events we
// are interested in. It also keeps track of a cursor in the database so we can resume from where we left off.

abstract class BaseEventHandler {
  private stepSize: number = 200;
  private stepTimeMs: number = 5000;
  private latestBlockOffset: number = 1;
  private eventNames: string[] = [];

  protected constructor(
    private readonly config: any,
    private readonly cursorService: CursorService,
    private readonly flowService: FlowService,
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

    const cursors = this.eventNames.map((eventName) => {
      const cursor = this.cursorService.upsertLatestCursor(
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

          console.log(
            `${eventName}: fromBlock=${fromBlock} toBlock=${toBlock} latestBlock=${newLatestBlockHeight}`
          );
        } catch (e) {
          console.warn(`${eventName}: Error retrieving block range:`, e);
        }

        if (fromBlock <= toBlock) {
          try {
            const result = await send([
              getEventsAtBlockHeightRange(eventName, fromBlock, toBlock),
            ]);
            const decoded = await fcl.decode(result);

            if (decoded.length) {
              decoded.forEach(async (event) => await this.onEvent(event));
            }

            // Record the last block that we synchronized up to
            blockCursor = await this.cursorService.updateCursorById(
              blockCursor.id,
              toBlock
            );
          } catch (e) {
            console.error(
              `${eventName}: Error retrieving events for block range fromBlock=${fromBlock} toBlock=${toBlock}`,
              e
            );
          }
        }

        setTimeout(poller, this.stepTimeMs);
      };

      // Start poller
      poller();
    });
  }

  abstract onEvent(event: any): Promise<void>;

  private async getBlockRange(currentBlockCursor) {
    const latestBlockHeight =
      (await this.flowService.getLatestBlockHeight()) - this.latestBlockOffset;

    const fromBlock = currentBlockCursor.currentBlockHeight + 1;
    let toBlock = currentBlockCursor.currentBlockHeight + this.stepSize;

    // Don't look ahead to unsealed blocks
    if (toBlock > latestBlockHeight) {
      toBlock = latestBlockHeight;
    }

    return { fromBlock, toBlock, latestBlockHeight };
  }
}

export default BaseEventHandler;
