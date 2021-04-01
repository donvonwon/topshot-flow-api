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
  private socket;

  constructor(
    private readonly config: any,
    private readonly eventsService: EventsService,
    private readonly dealsService: DealsService
  ) {}

  attach(socket): void {
    this.socket = socket;
  }

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
        if (this.socket) {
          this.socket.emit("deals.listed", deal);
        }

        await deal.save();
      }
    } catch (e) {
      console.error(e.message);
    }

    return;
  }

  async purchaseHandler(change: PurchaseChange): Promise<void> {
    const purchase = change.fullDocument;

    if (!purchase) {
      return;
    }

    try {
      const momentId = String(purchase.metadata.id);
      const deal = await this.dealsService.setDealBought(momentId);

      if (deal && this.socket) {
        this.socket.emit("deals.bought", deal);
      }
    } catch (e) {
      console.error(e);
    }

    return;
  }

  async run(): Promise<this> {
    const listingStream = await this.eventsService.getListingStream();
    const purchaseStream = await this.eventsService.getPurchaseStream();

    listingStream.on("change", this.listingHandler.bind(this));
    purchaseStream.on("change", this.purchaseHandler.bind(this));

    return this;
  }
}

export default DealsWorker;
