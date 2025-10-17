import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  fromAccountNumber: string;
  toAccountNumber: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  description?: string;
  createdAt: Date;
}

export interface ITransactionDocument extends ITransaction, Document {
  _id: string;
}

const transactionSchema = new Schema<ITransaction>({
  fromAccountNumber: {
    type: String,
    required: true
  },
  toAccountNumber: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  },
  description: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

transactionSchema.index({ fromAccountNumber: 1, createdAt: -1 });
transactionSchema.index({ toAccountNumber: 1, createdAt: -1 });
transactionSchema.index({ createdAt: -1 });

export default mongoose.model<ITransaction>('Transaction', transactionSchema);