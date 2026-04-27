import "dotenv/config";
import mongoose from "mongoose";
import { DATABASE_URL } from "./config.js";

mongoose
  .connect(DATABASE_URL || "mongodb://localhost:27017/paytm")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });

const { Schema, model } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minLength: 3,
    maxLength: 30,
  },
  password: { type: String, required: true, minLength: 6 },
  firstName: { type: String, required: true, trim: true, maxLength: 50 },
  lastName: { type: String, required: true, trim: true, maxLength: 50 },
});

const accountSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  balance: {
    type: Number,
    required: true,
  },
});

const refreshTokenSchema = new Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Index for faster lookup and automatic cleanup of expired tokens
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const transactionSchema = new Schema({
from: {
type: Schema.Types.ObjectId,
ref: "User",
required: true,
},
to: {
type: Schema.Types.ObjectId,
ref: "User",
required: true,
},
amount: {
type: Number,
required: true,
},
note: {
type: String,
default: "",
},
createdAt: {
type: Date,
default: Date.now,
},
});

const resetTokenSchema = new Schema({
	  token: {
	    type: String,
	    required: true,
	    unique: true,
	  },
	  userId: {
	    type: Schema.Types.ObjectId,
	    ref: "User",
	    required: true,
	  },
	  expiresAt: {
	    type: Date,
	    required: true,
	  },
	  createdAt: {
	    type: Date,
	    default: Date.now,
	  },
	});

// Index for automatic cleanup of expired reset tokens
resetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Transaction = model("Transaction", transactionSchema);
export const Account = model("Account", accountSchema);
export const User = model("User", userSchema);
export const RefreshToken = model("RefreshToken", refreshTokenSchema);
export const ResetToken = model("ResetToken", resetTokenSchema);
