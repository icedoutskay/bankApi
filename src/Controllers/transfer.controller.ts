import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import {Account }from "../Models/account.model";
import {Transfer} from "../Models/transfer.model";

export const createTransfer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { fromAccountId, toAccountId, amount } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!fromAccountId || !toAccountId || !amount)
      throw new Error("Missing required fields");

    const from = await Account.findById(fromAccountId).session(session);
    const to = await Account.findById(toAccountId).session(session);

    if (!from || !to) throw new Error("Invalid account(s)");
    if (from.balance < amount) throw new Error("Insufficient funds");

    // Check if the authenticated user owns the account
    if (req.user?._id && !from.owner.equals(req.user._id)) {
      throw new Error("Unauthorized transfer");
    }

    from.balance -= amount;
    to.balance += amount;

    await from.save({ session });
    await to.save({ session });

    const [transfer] = await Transfer.create(
      [
        {
          fromAccount: from._id,
          toAccount: to._id,
          amount,
          status: "completed",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    res.status(201).json({
      message: "Transfer successful",
      transfer,
    });
  } catch (err: any) {
    await session.abortTransaction();
    res.status(400).json({ error: err.message });
  } finally {
    session.endSession();
  }
};