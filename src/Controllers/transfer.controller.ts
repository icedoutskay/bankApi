import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User.model';
import Transaction, { ITransactionDocument } from '../models/Transaction.model';
import { formatTransactionResponse } from '../helpers/account.helper';


export const initiateTransfer = async (req: Request, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.userId) {
      await session.abortTransaction();
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { toAccountNumber, amount, description } = req.body;

    const sender = await User.findById(req.userId).session(session);
    if (!sender) {
      await session.abortTransaction();
      res.status(404).json({ error: 'Sender account not found' });
      return;
    }

    if (sender.balance < amount) {
      await session.abortTransaction();
      res.status(400).json({ error: 'Insufficient balance' });
      return;
    }

    const receiver = await User.findOne({ accountNumber: toAccountNumber }).session(session);
    if (!receiver) {
      await session.abortTransaction();
      res.status(404).json({ error: 'Receiver account not found' });
      return;
    }

    if (sender.accountNumber === toAccountNumber) {
      await session.abortTransaction();
      res.status(400).json({ error: 'Cannot transfer to your own account' });
      return;
    }

    sender.balance -= amount;
    receiver.balance += amount;

    await sender.save({ session });
    await receiver.save({ session });

    const transaction = await Transaction.create({
      fromAccountNumber: sender.accountNumber,
      toAccountNumber,
      amount,
      description,
      status: 'completed'
    }) as ITransactionDocument;

    await transaction.save({ session });
    await session.commitTransaction();

    res.status(201).json({
      message: 'Transfer successful',
      transaction: {
        id: transaction._id.toString(),
        from: sender.accountNumber,
        to: toAccountNumber,
        amount,
        description,
        status: transaction.status,
        createdAt: transaction.createdAt
      },
      newBalance: sender.balance
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Transfer error:', error);
    res.status(500).json({ error: 'Server error during transfer' });
  } finally {
    session.endSession();
  }
};

export const getTransactionHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const transactions = await Transaction.find({
      $or: [
        { fromAccountNumber: user.accountNumber },
        { toAccountNumber: user.accountNumber }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(50);

    const formattedTransactions = transactions.map(txn => 
      formatTransactionResponse(txn, user.accountNumber)
    );

    res.json({
      accountNumber: user.accountNumber,
      transactions: formattedTransactions
    });
  } catch (error) {
    console.error('Get transaction history error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};