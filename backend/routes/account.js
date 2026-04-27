import express from "express";
import mongoose from "mongoose";
const router = express.Router();
import { Account, Transaction, User } from "../db.js";
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
    code: "BALANCE_FETCHED",
  });
});

// Get recent contacts (users you've transacted with)
router.get("/contacts", authMiddleWare, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    // Find unique users from transactions (where you sent or received money)
    const transactions = await Transaction.find({
      $or: [{ from: req.userId }, { to: req.userId }],
    })
      .sort({ createdAt: -1 })
      .limit(50) // Get last 50 transactions to find contacts
      .populate("from", "firstName lastName username")
      .populate("to", "firstName lastName username");

    // Extract unique contacts
    const contactIds = new Set();
    const contacts = [];

    transactions.forEach((t) => {
      // Add 'to' user if they're not the current user and not already added
      if (
        t.to._id.toString() !== req.userId.toString() &&
        !contactIds.has(t.to._id.toString())
      ) {
        contactIds.add(t.to._id.toString());
        contacts.push({
          _id: t.to._id,
          firstName: t.to.firstName,
          lastName: t.to.lastName,
          username: t.to.username,
          lastTransaction: t.createdAt,
          type: "sent",
        });
      }
      // Add 'from' user if they're not the current user and not already added
      if (
        t.from._id.toString() !== req.userId.toString() &&
        !contactIds.has(t.from._id.toString())
      ) {
        contactIds.add(t.from._id.toString());
        contacts.push({
          _id: t.from._id,
          firstName: t.from.firstName,
          lastName: t.from.lastName,
          username: t.from.username,
          lastTransaction: t.createdAt,
          type: "received",
        });
      }
    });

    // Sort by most recent transaction and limit
    contacts.sort(
      (a, b) => new Date(b.lastTransaction) - new Date(a.lastTransaction),
    );
    res.json({ contacts: contacts.slice(0, limit) });
  } catch (err) {
    logger.error(`Error fetching contacts for user ${req.userId}:`, err);
    res
      .status(500)
      .json({
        code: "FETCH_CONTACTS_FAILED",
        message: "Failed to fetch contacts",
      });
  }
});

// Transfer validation schema
const transferSchema = zod.object({
  to: zod.string().min(1, { message: "Recipient ID is required" }),
  amount: zod
    .number()
    .positive({ message: "Amount must be greater than zero" })
    .max(1000000, { message: "Amount exceeds maximum transfer limit" })
    .refine((val) => val > 0, { message: "Amount must be greater than zero" }),
  note: zod.string().optional(),
});

router.put("/transfer", authMiddleWare, async (req, res) => {
  const session = await mongoose.startSession();
  try {
    // Validate request body
    const result = transferSchema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map((error) => ({
        field: error.path[0],
        message: error.message,
      }));

      return res.status(400).json({
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        errors,
      });
    }

    const { to, amount } = req.body;

    session.startTransaction();

    // Prevent self-transfer
    if (to === req.userId.toString()) {
      await session.abortTransaction();
      return res.status(400).json({
        code: "SELF_TRANSFER",
        message: "Cannot transfer to yourself",
      });
    }

    const senderAccount = await Account.findOne({
      userId: req.userId,
    }).session(session);

    if (!senderAccount) {
      await session.abortTransaction();
      return res.status(404).json({
        code: "SENDER_NOT_FOUND",
        message: "Sender account not found",
      });
    }

    // Check for sufficient funds with a small buffer for precision
    if (senderAccount.balance < amount) {
      await session.abortTransaction();
      return res.status(400).json({
        code: "INSUFFICIENT_FUNDS",
        message: "Insufficient funds",
      });
    }

    const reciverAccount = await Account.findOne({
      userId: to,
    }).session(session);

    if (!reciverAccount) {
      session.abortTransaction();
      return res.status(404).json({
        code: "RECIPIENT_NOT_FOUND",
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
          note: req.body.note || "",
        },
      ],
      { session },
    );

    await session.commitTransaction();

    res.json({
      code: "TRANSFER_SUCCESS",
      message: "Transaction successful",
    });
  } catch (err) {
    await session.abortTransaction();
    logger.error("Transfer error:", err);
    res.status(500).json({
      code: "TRANSFER_FAILED",
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

    logger.info(
      `Fetching transaction logs for user ${req.userId}, page ${page}, limit ${limit}`,
    );

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
        note: t.note || "",
        createdAt: t.createdAt,
      })),
      total,
      page,
      limit,
    };

    logger.info(
      `Returning ${result.transactions.length} transactions for user ${req.userId}`,
    );
    res.json(result);
  } catch (err) {
    logger.error(`Error fetching logs for user ${req.userId}:`, err);
    res.status(500).json({
      code: "FETCH_LOGS_FAILED",
      message: "Failed to fetch transaction logs",
    });
  }
});

export default router;
