import RawEvent from "../models/RawEvent";

class EventsService {
  constructor() {}

  async getListingStream(): Promise<any> {
    return RawEvent.watch([
      {
        $match: {
          "fullDocument.type": "A.c1e4f4f4c4257510.Market.MomentListed",
        },
      },
    ]);
  }

  async getPurchaseStream(): Promise<any> {
    return RawEvent.watch([
      {
        $match: {
          "fullDocument.type": "A.c1e4f4f4c4257510.Market.MomentPurchased",
        },
      },
    ]);
  }

  async save(event: any) {
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

export default EventsService;
