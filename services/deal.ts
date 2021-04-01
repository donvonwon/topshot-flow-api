import get from "lodash/get";
import pick from "lodash/pick";
import Deal from "../models/Deal";
import MomentRanksService from "./momentranks";
import TopshotService from "./topshot";

type Listing = {
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

class DealsService {
  private static MIN_PROFIT_MARGIN = 0.15;
  private static STRENGTH_1_MAX = 0.45;
  private static STRENGTH_2_MAX = 0.65;
  private static STRENGTH_3_MAX = 1.0;
  private static STRENGTH_4_MAX = 1.5;

  constructor(
    private readonly momentranksService: MomentRanksService,
    private readonly topshotService: TopshotService
  ) {}

  private getDealStrength = (profitMargin): number => {
    if (profitMargin < DealsService.MIN_PROFIT_MARGIN) {
      return 0;
    } else if (
      profitMargin >= DealsService.MIN_PROFIT_MARGIN &&
      profitMargin < DealsService.STRENGTH_1_MAX
    ) {
      return 1;
    } else if (
      profitMargin >= DealsService.STRENGTH_1_MAX &&
      profitMargin < DealsService.STRENGTH_2_MAX
    ) {
      return 2;
    } else if (
      profitMargin >= DealsService.STRENGTH_2_MAX &&
      profitMargin < DealsService.STRENGTH_3_MAX
    ) {
      return 3;
    } else if (
      profitMargin >= DealsService.STRENGTH_3_MAX &&
      profitMargin < DealsService.STRENGTH_4_MAX
    ) {
      return 4;
    } else if (profitMargin >= DealsService.STRENGTH_4_MAX) {
      return 5;
    }

    return 0;
  };

  private profitMargin = (basis, current) => (basis - current) / current;

  async setDealBought(momentId: string) {
    return Deal.findOneAndUpdate(
      {
        _id: momentId,
      },
      {
        isBought: true,
        updatedAt: new Date(),
      },
      {
        new: true,
      }
    );
  }

  async buildFromListing(listing: Listing) {
    const [moment, mint] = await Promise.all([
      this.momentranksService.getMomentByPlayerSet(
        get(listing, "metadata.play.FullName"),
        get(listing, "metadata.setName")
      ),
      this.momentranksService.getMintByGlobalId(get(listing, "metadata.id")),
    ]);

    if (!moment || !mint) {
      return;
    }

    const { hashedId, blockHeight, blockTimestamp, data, metadata, createdAt, updatedAt } = listing;
    const { MRvalue } = mint;
    const profitMargin = this.profitMargin(MRvalue, data.price);
    const dealStrength = this.getDealStrength(profitMargin);
    const momentId = get(metadata, "id");

    const deal = new Deal({
      _id: String(momentId),
      hashedId,
      blockHeight,
      blockTimestamp,
      price: data.price,
      sellerAddress: data.seller,
      profitMargin,
      dealStrength,
      playDate: moment.date,
      ...pick(moment, [
        "setId",
        "playId",
        "inCirculation",
        "setName",
        "seriesNumber",
        "playerName",
        "jerseyNumber",
        "imageURL",
        "floorPrice",
        "playCategory",
      ]),
      ...pick(mint, ["MRvalue", "serialNumber"]),
      isBought: false,
      createdAt,
      updatedAt,
      dapperMomentId: mint.dapperId,
    });

    // Populating listing information from topshot
    // Still return if cant look it up
    try {
      const [minted, listings] = await Promise.all([
        this.topshotService.getMintedMoment(deal.dapperMomentId),
        this.topshotService.getMomentPriceRange(deal.setId, deal.playId),
      ]);

      const { set, setPlay, price, listingOrderID, owner } = minted;
      const { priceRange, momentListingCount } = listings;

      deal.setVisualId = set.setVisualId;
      deal.inCirculation = setPlay.circulationCount;
      deal.listingOwnerUsername = owner.username;
      deal.listingOwnerProfileImage = owner.profileImageUrl;
      deal.listingOwnerDapperID = owner.dapperID;
      deal.listingId = listingOrderID;
      deal.listingPrice = price;
      deal.listingCount = momentListingCount;
      deal.listingMinPrice = priceRange.min;
      deal.listingMaxPrice = priceRange.max;
    } catch (error) {
      console.error(`DealService:buildFromListing:populating-ts-listing ${deal.dapperMomentId}`);
    }

    return deal;
  }
}

export default DealsService;
