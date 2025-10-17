import { Request, Response } from 'express';
import User from '../models/User.model';
import Transaction from '../models/Transaction.model';
import { formatUserResponse } from '../helpers/account.helper';

export const getAllUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password');
    
    res.json({
      count: users.length,
      users: users.map(user => formatUserResponse(user))
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAllTransactions = async (_req: Request, res: Response): Promise<void> => {
  try {
    const transactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json({
      count: transactions.length,
      transactions
    });
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const adminDeposit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { accountNumber, amount, description } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ error: 'Amount must be greater than 0' });
      return;
    }

    const user = await User.findOne({ accountNumber });
    
    if (!user) {
      res.status(404).json({ error: 'User account not found' });
      return;
    }

    user.balance += amount;
    await user.save();

    const transaction = new Transaction({
      fromAccountNumber: 'ADMIN_DEPOSIT',
      toAccountNumber: user.accountNumber,
      amount,
      description: description || 'Admin deposit',
      status: 'completed'
    });

    await transaction.save();

    res.status(201).json({
      message: 'Admin deposit successful',
      user: {
        accountNumber: user.accountNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        newBalance: user.balance
      },
      transaction: {
    id: String(transaction._id),
        amount,
        description: transaction.description,
        createdAt: transaction.createdAt
      }
    });
  } catch (error) {
    console.error('Admin deposit error:', error);
    res.status(500).json({ error: 'Server error during admin deposit' });
  }
};