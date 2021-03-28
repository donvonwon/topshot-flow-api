import { model, Schema, Model, Document } from "mongoose";
import versioner from "../plugins/versioner";

export interface IEvent extends Document {
  hashedId: string;
  blockId: string;
  blockHeight: number;
  blockTimestamp: string;
  type: string;
  transactionId: string;
  transactionIndex: number;
  eventIndex: number;
  data: object;
  metadata: object;
}

const EventSchema: Schema = new Schema(
  {
    hashedId: { type: String, required: true },
    blockId: { type: String, required: true },
    blockHeight: { type: Number, required: true },
    blockTimestamp: { type: String, required: true },
    type: { type: String, required: true },
    transactionId: { type: String, required: true },
    transactionIndex: { type: Number, required: true },
    eventIndex: { type: Number, required: true },
    data: { type: Schema.Types.Mixed, required: false },
    metadata: { type: Schema.Types.Mixed, required: false },
  },
  { autoIndex: true, timestamps: true }
);

EventSchema.plugin(versioner);

const RawEvent: Model<IEvent> = model("RawEvent", EventSchema);

export default RawEvent;
