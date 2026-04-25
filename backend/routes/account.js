import express from "express";
import mongoose from "mongoose";
const router = express.Router();
import { Account, Transaction } from "../db.js";
import { authMiddleWare } from "../middleware.js";
import logger from "../utils/logger.js";
import zod from "zod";

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

// Transfer validation schema
const transferSchema = zod.object({
  to: zod.string().min(1, { message: "Recipient ID is required" }),
  amount: zod.number()
    .positive({ message: "Amount must be greater than zero" })
    .max(1000000, { message: "Amount exceeds maximum transfer limit" })
    .refine(val => val > 0, { message: "Amount must be greater than zero" })
});

router.put("/transfer", authMiddleWare, async (req, res) => {
  const session = await mongoose.startSession();
  try {
    // Validate request body
    const result = transferSchema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map(error => ({
        field: error.path[0],
        message: error.message
      }));

      return res.status(400).json({
        message: "Validation failed",
        errors
      });
    }

    const { to, amount } = req.body;

    session.startTransaction();

    // Prevent self-transfer
    if (to === req.userId.toString()) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Cannot transfer to yourself",
      });
    }

    const senderAccount = await Account.findOne({
      userId: req.userId,
    }).session(session);

    if (!senderAccount) {
      await session.abortTransaction();
      return res.status(404).json({
        message: "Sender account not found",
      });
    }

    // Check for sufficient funds with a small buffer for precision
    if (senderAccount.balance < amount) {
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
      return res.status(404).json({
        message: "Recipient account not found",
      });
    }

    // Perform the transfer
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
    logger.error("Transfer error:", err);
    res.status(500).json({
      message: "Transaction failed",
    });
  } finally {
    session.endSession();
  }
});

router.get("/logs", authMiddleWare, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    logger.info(`Fetching transaction logs for user ${req.userId}, page ${page}, limit ${limit}`);

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

    const result = {
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
    };

    logger.info(`Returning ${result.transactions.length} transactions for user ${req.userId}`);
    res.json(result);
  } catch (err) {
    logger.error(`Error fetching logs for user ${req.userId}:`, err);
    res.status(500).json({
      message: "Failed to fetch transaction logs",
    });
  }
});

export default router;
