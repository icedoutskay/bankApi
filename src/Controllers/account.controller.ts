import { Request, Response } from 'express';
import User from '../models/User.model';
import Transaction from '../models/Transaction.model';

export const getBalance = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      accountNumber: user.accountNumber,
      balance: user.balance,
      firstName: user.firstName,
      lastName: user.lastName
    });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deposit = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { amount, description } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ error: 'Amount must be greater than 0' });
      return;
    }

    const user = await User.findById(req.userId);
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    user.balance += amount;
    await user.save();

    const transaction = new Transaction({
      fromAccountNumber: 'SYSTEM',
      toAccountNumber: user.accountNumber,
      amount,
      description: description || 'Deposit',
      status: 'completed'
    });

    await transaction.save();

    res.status(201).json({
      message: 'Deposit successful',
      transaction: {
    id: String(transaction._id),
        amount,
        description: transaction.description,
        status: transaction.status,
        createdAt: transaction.createdAt
      },
      newBalance: user.balance
    });
  } catch (error) {
    console.error('Deposit error:', error);
    res.status(500).json({ error: 'Server error during deposit' });
  }
};