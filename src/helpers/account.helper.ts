// src/helpers/account.helper.ts
import { IUser } from '../models/User.model';
import { ITransaction } from '../models/Transaction.model';


export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  accountNumber: string;
  role: 'user' | 'admin';
  balance: number;
  createdAt: Date;
}

export interface TransactionResponse {
  id: string;
  type: 'debit' | 'credit';
  from: string;
  to: string;
  amount: number;
  description?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}

export const generateAccountNumber = (): string => {
  const randomDigits = Math.floor(Math.random() * 10000000000)
    .toString()
    .padStart(10, '0');
  return '10' + randomDigits;
};

export const formatUserResponse = (user: IUser): UserResponse => {
  return {
     id: String(user._id),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    accountNumber: user.accountNumber,
    role: user.role,
    balance: user.balance,
    createdAt: user.createdAt
  };
};

export const formatTransactionResponse = (
  transaction: ITransaction,
  userAccountNumber: string
): TransactionResponse => {
  return {
    id: String(transaction._id),
    type: transaction.fromAccountNumber === userAccountNumber ? 'debit' : 'credit',
    from: transaction.fromAccountNumber,
    to: transaction.toAccountNumber,
    amount: transaction.amount,
    description: transaction.description,
    status: transaction.status,
    createdAt: transaction.createdAt
  };
};