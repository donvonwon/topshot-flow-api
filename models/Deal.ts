import { model, Schema, Model, Document } from "mongoose";
import versioner from "../plugins/versioner";

export interface IDeal extends Document {
  _id: string;
  momentId: number;
  MRvalue: number;
  blockHeight: number;
  blockTimestamp: string;
  dealStrength: number;
  floorPrice: number;
  hashedId: string;
  imageURL: string;
  inCirculation: number;
  isBought: boolean;
  jerseyNumber: number;
  listingCount: number;
  playCategory: string;
  playDate: string;
  playId: string;
  playerName: string;
  price: number;
  minPrice: number;
  maxPrice: number;
  profitMargin: number;
  sellerAddress: string;
  serialNumber: number;
  seriesNumber: number;
  setId: string;
  setName: string;
  listingOwnerUsername: string;
  listingOwnerProfileImage: string;
  listingOwnerDapperID: string;
  listingId: string;
  listingPrice: string;
  dapperMomentId: string;
  setVisualId: string;
  listingMinPrice: string;
  listingMaxPrice: string;
}

const DealSchema: Schema = new Schema(
  {
    _id: String,
    momentId: Number,
    MRvalue: Number,
    blockHeight: Number,
    blockTimestamp: String,
    dealStrength: Number,
    floorPrice: Number,
    hashedId: String,
    imageURL: String,
    inCirculation: Number,
    isBought: Boolean,
    jerseyNumber: Number,
    listingCount: Number,
    playCategory: String,
    playDate: String,
    playId: String,
    playerName: String,
    price: Number,
    minPrice: Number,
    maxPrice: Number,
    profitMargin: Number,
    sellerAddress: String,
    serialNumber: Number,
    seriesNumber: Number,
    setId: String,
    setName: String,
    listingOwnerUsername: String,
    listingOwnerProfileImage: String,
    listingOwnerDapperID: String,
    listingId: String,
    listingPrice: String,
    dapperMomentId: String,
    setVisualId: String,
    listingMinPrice: String,
    listingMaxPrice: String,
  },
  { autoIndex: true, timestamps: true }
);

DealSchema.plugin(versioner);

const Deal: Model<IDeal> = model("Deal", DealSchema);

export default Deal;
