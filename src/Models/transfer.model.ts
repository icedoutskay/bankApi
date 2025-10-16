import { Schema, model, Document, Types } from "mongoose";

export interface ITransfer extends Document {
  fromAccount: Types.ObjectId;
  toAccount: Types.ObjectId;
  amount: number;
  status: "pending" | "completed" | "failed";
  createdAt: Date;
}

const transferSchema = new Schema<ITransfer>({
  fromAccount: { type: Schema.Types.ObjectId, ref: "Account", required: true },
  toAccount: { type: Schema.Types.ObjectId, ref: "Account", required: true },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

export const Transfer = model<ITransfer>("Transfer", transferSchema);
