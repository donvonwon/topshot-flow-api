let tempCursors = {};

class CursorService {
  async findOrInsertLatestCursor(eventName: string, latestBlockHeight: number) {
    if (!tempCursors[eventName]) {
      tempCursors[eventName] = {
        eventName,
        currentBlockHeight: latestBlockHeight,
      };
    }
    return tempCursors[eventName];
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
