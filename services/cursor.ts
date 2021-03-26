let tempCursors = {};

class CursorService {
  async upsertLatestCursor(eventName: string, latestBlockHeight: number) {
    let blockCursor = tempCursors[eventName];
    if (!blockCursor) {
      tempCursors[eventName] = {
        eventName,
        currentBlockHeight: latestBlockHeight,
      };

      blockCursor = tempCursors[eventName];
    }
    return blockCursor;
  }

  async updateCursorById(id: string, currentBlockHeight: number) {
    tempCursors[id] = {
      ...tempCursors[id],
      currentBlockHeight,
    };
    return tempCursors[id];
  }
}

export default CursorService;
