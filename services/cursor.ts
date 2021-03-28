import BlockCursor from "../models/BlockCursor";

class CursorService {
  async findOrInsertLatestCursor(eventName: string, latestBlockHeight: number) {
    let blockCursor = await BlockCursor.findOne({ eventName });
    if (!blockCursor) {
      // Create the first block cursor
      blockCursor = await BlockCursor.create({
        eventName,
        currentBlockHeight: latestBlockHeight,
      });
    }
    return blockCursor;
  }

  async updateCursorByEventName(eventName: string, currentBlockHeight: number) {
    return BlockCursor.findOneAndUpdate(
      { eventName },
      {
        currentBlockHeight,
      },
      {
        new: true,
        useFindAndModify: false,
      }
    );
  }
}

export default CursorService;
