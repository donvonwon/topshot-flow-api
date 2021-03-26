let tempCursor = {
  id: "a",
  eventName: "MomentPurchased",
  currentBlockHeight: 27079384,
};

class CursorService {
  async upsertLatestCursor(eventName: string, latestBlockHeight: number) {
    tempCursor = {
      ...tempCursor,
      eventName,
      currentBlockHeight: latestBlockHeight,
    };
    return tempCursor;
  }

  async updateCursorById(id: string, currentBlockHeight: number) {
    tempCursor = {
      ...tempCursor,
      id,
      currentBlockHeight,
    };
    return tempCursor;
  }
}

export default CursorService;
