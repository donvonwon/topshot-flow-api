import RawEvent from "../models/RawEvent";

class WorkerService {
  async saveRawEvent(event: any) {
    return RawEvent.findOneAndUpdate({ hashedId: event.hashedId }, event, {
      new: true, // Return new record
      upsert: true,
    });
  }
}

export default WorkerService;
