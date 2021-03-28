import { model, Schema, Model, Document } from "mongoose";
import versioner from "../plugins/versioner";

export interface IBlockCursor extends Document {
  eventName: string;
  currentBlockHeight: number;
}

const BlockCursorSchema: Schema = new Schema(
  {
    eventName: { type: String, required: true },
    currentBlockHeight: { type: Number, required: true },
  },
  { autoIndex: true, timestamps: true }
);

BlockCursorSchema.plugin(versioner);

const BlockCursor: Model<IBlockCursor> = model(
  "BlockCursor",
  BlockCursorSchema
);

export default BlockCursor;
