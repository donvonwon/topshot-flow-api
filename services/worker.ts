import RawEvent from "../models/RawEvent";

class WorkerService {
  async saveRawEvent(event: any) {
    return RawEvent.create(event);
  }
}

export default WorkerService;
