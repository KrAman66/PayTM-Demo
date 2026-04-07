import express from "express";
import mongoose from "mongoose";
const router = express.Router();
import { Account, Transaction } from "../db.js";
import { authMiddleWare } from "../middleware.js";

router.get("/balance", authMiddleWare, async (req, res) => {
  const account = await Account.findOne({
    userId: req.userId,
  });

  if (!account) {
    await Account.create({
      userId: req.userId,
      balance: 0,
    });
    return res.json({
      balance: "0.00",
    });
  }

  res.json({
    balance: account.balance.toFixed(2),
  });
});

router.put("/transfer", authMiddleWare, async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { to, amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({
      message: "Invalid amount",
    });
  }

    const senderAccount = await Account.findOne({
      userId: req.userId,
    }).session(session);

    if (!senderAccount || senderAccount.balance < amount) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Insufficient funds",
      });
    }

    const reciverAccount = await Account.findOne({
      userId: to,
    }).session(session);

    if (!reciverAccount) {
      session.abortTransaction();
      return res.status(400).json({
        message: "Invalid account",
      });
    }

    await Account.updateOne(
      {
        userId: req.userId,
      },
      {
        $inc: {
          balance: -amount,
        },
      },
    ).session(session);

    await Account.updateOne(
      {
        userId: to,
      },
      {
        $inc: {
          balance: amount,
        },
      },
    ).session(session);

    await Transaction.create(
      [
        {
          from: req.userId,
          to,
          amount,
        },
      ],
      { session },
    );

    await session.commitTransaction();

    res.json({
      message: "Transaction successful",
    });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({
      message: "Transaction failed",
    });
  } finally {
    session.endSession();
  }
});

router.get("/logs", authMiddleWare, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const transactions = await Transaction.find({
    $or: [{ from: req.userId }, { to: req.userId }],
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("from", "firstName lastName")
    .populate("to", "firstName lastName");

  const total = await Transaction.countDocuments({
    $or: [{ from: req.userId }, { to: req.userId }],
  });

  res.json({
    transactions: transactions.map((t) => ({
      _id: t._id,
      from: t.from.firstName + " " + t.from.lastName,
      to: t.to.firstName + " " + t.to.lastName,
      amount: t.amount.toFixed(2),
      isCredit: t.to._id.toString() === req.userId,
      createdAt: t.createdAt,
    })),
    total,
    page,
    limit,
  });
});

export default router;
