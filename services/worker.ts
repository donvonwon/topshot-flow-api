import RawEvent from "../models/RawEvent";

class WorkerService {
  async saveRawEvent(event: any) {
    return RawEvent.findOneAndUpdate(
      {
        hashedId: event.hashedId,
      },
      event,
      {
        upsert: true,
        returnOriginal: false,
        useFindAndModify: false,
      }
    );
  }
}

export default WorkerService;
