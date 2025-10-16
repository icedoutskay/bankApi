import { Schema, model, Document, Types } from "mongoose";

export interface IAccount extends Document {
  owner: Types.ObjectId;
  accountNumber: string;
  balance: number;
}

const accountSchema = new Schema<IAccount>({
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  accountNumber: { type: String, unique: true, required: true },
  balance: { type: Number, default: 0 },
});

export const Account = model<IAccount>("Account", accountSchema);
