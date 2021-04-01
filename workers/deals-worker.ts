import DealsService from "../services/deal";
import EventsService from "../services/event";

type ListingChange = {
  _id: object;
  operationType: string;
  fullDocument: {
    _id: string;
    hashedId: string;
    blockHeight: number;
    blockTimestamp: string;
    transactionId: string;
    transactionIndex: number;
    type: string;
    createdAt: string;
    updatedAt: string;
    data: {
      id: string;
      price: number;
      seller: string;
    };
    metadata: {
      id: number;
    };
  };
  ns: object;
  documentKey: object;
};

type PurchaseChange = {
  _id: object;
  operationType: string;
  fullDocument: {
    _id: string;
    hashedId: string;
    blockHeight: number;
    blockTimestamp: string;
    createdAt: string;
    updatedAt: string;
    transactionId: string;
    transactionIndex: number;
    type: string;
    data: {
      id: string;
      price: number;
      seller: string;
    };
    metadata: {
      id: number;
      playId: number;
      play: object;
      setId: number;
      setName: string;
      serialNumber: number;
      price: string;
    };
  };
  ns: object;
  documentKey: object;
};

class DealsWorker {
  constructor(
    private readonly config: any,
    private readonly socket: any,
    private readonly eventsService: EventsService,
    private readonly dealsService: DealsService
  ) {}

  async listingHandler(change: ListingChange): Promise<void> {
    const listing = change.fullDocument;

    if (!listing) {
      return;
    }

    try {
      const deal = await this.dealsService.buildFromListing(listing);

      if (!deal) {
        console.log(`DealsWorker Error: Could not create deal from listing ${listing._id}`);
        return;
      }

      if (deal.dealStrength > 0) {
        this.socket.emit("deals.listed", deal);
      }

      //
      // if (dealStrength > 0) {
      //   // Send optimistically
      //   // console.log(`Emitting ${dealParams.playerName} w/ Deal: ${dealStrength}`);
      //   // socket.emit("deals.listed", dealParams);
      //
      //   const findMomentListing = async () => {
      //     try {
      //       const data = await getListings(tsClient, moment.setId, moment.playId);
      //
      //       if (data) {
      //         const momentListingLookup = keyBy(data.momentListings, "moment.flowSerialNumber");
      //         dealParams.listing = momentListingLookup[String(mint.serialNumber)];
      //         dealParams.priceRange = data.priceRange;
      //         dealParams.listingCount = data.momentListingCount;
      //         return dealParams;
      //       }
      //     } catch (e) {
      //       console.log(e.message);
      //     }
      //   };
      //
      //   const persistDeal = async (deal) => {
      //     console.log(`Emitting ${dealParams.playerName} w/ Deal: ${dealStrength}`);
      //     socket.emit("deals.listed", deal);
      //     await db.collection("deals").replaceOne(
      //       {
      //         _id: String(get(metadata, "id")),
      //       },
      //       deal,
      //       {
      //         upsert: true,
      //       }
      //     );
      //     console.log(`Saved deal for ${deal.playerName} Deal: ${deal.dealStrength}`);
      //   };
      //
      //   const retrySleepMs = 1000;
      //   const MAX_RETRIES = 3;
      //
      //   const performFind = async (retries) => {
      //     let newRetry = retries + 1;
      //     if (retries > MAX_RETRIES) {
      //       console.log("Could not find TS listing", dealParams.playerName);
      //       return;
      //     }
      //
      //     const found = await findMomentListing();
      //
      //     if (found.listing) {
      //       await persistDeal(found);
      //     } else {
      //       // Sleep before next request of data
      //       await new Promise((resolve) => setTimeout(resolve, retrySleepMs));
      //       await performFind(newRetry);
      //     }
      //   };
      //
      //   // Run retry find
      //   await performFind(0);
      // }
    } catch (e) {
      console.error(e);
    }

    return;
  }

  async purchaseHandler(change: PurchaseChange): Promise<void> {
    // console.log(change);
    return;
  }

  async run(): Promise<void> {
    const listingStream = await this.eventsService.getListingStream();
    const purchaseStream = await this.eventsService.getPurchaseStream();

    listingStream.on("change", this.listingHandler.bind(this));
    purchaseStream.on("change", this.purchaseHandler.bind(this));
  }
}

export default DealsWorker;
