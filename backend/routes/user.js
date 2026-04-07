import express from "express";
const router = express.Router();
import zod from "zod";
import { User, Account } from "../db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { JWT_SECRET } from "../config.js";
import { authMiddleWare } from "../middleware.js";

const signUpSchema = zod.object({
  username: zod.string().email(),
  password: zod.string(),
  firstName: zod.string(),
  lastName: zod.string(),
});

const signInSchema = zod.object({
  username: zod.string().email(),
  password: zod.string(),
});

const updateBody = zod.object({
  password: zod.string().optional(),
  firstName: zod.string().optional(),
  lastName: zod.string().optional(),
});

router.post("/signup", async (req, res) => {
  const { success } = signUpSchema.safeParse(req.body);

  if (!success) {
    return res.status(411).json({
      message: "Email already taken / Incorrect inputs",
    });
  }

  const existingUser = await User.findOne({
    username: req.body.username,
  });

  if (existingUser) {
    return res.status(411).json({
      message: "Email already taken / Incorrect inputs",
    });
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  const user = await User.create({
    username: req.body.username,
    password: hashedPassword,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
  });

  const userId = user._id;

  // assigning random amount to new user
  await Account.create({
    userId,
    balance: 1 + Math.random() * 10000,
  });

  //generating new token
  const token = jwt.sign(
    {
      userId,
    },
    JWT_SECRET,
  );

  res.json({
    message: "User created successfully",
    token: token,
    firstName: user.firstName,
    lastName: user.lastName,
  });
});

router.post("/signin", async (req, res) => {
  const { success } = signInSchema.safeParse(req.body);

  if (!success) {
    return res.status(411).json({
      message: "Error in sign in check username or password",
    });
  }

  const user = await User.findOne({
    username: req.body.username,
  });

  if (!user) {
    return res.status(411).json({
      message: "User does not exist please sign up",
    });
  }

  const isValid = await bcrypt.compare(req.body.password, user.password);
  if (!isValid) {
    return res.status(411).json({
      message: "User does not exist please sign up",
    });
  }

  const token = jwt.sign(
    {
      userId: user._id,
    },
    JWT_SECRET,
  );

  res.json({
    token: token,
    firstName: user.firstName,
    lastName: user.lastName,
  });
});

router.put("/", authMiddleWare, async (req, res) => {
  const { success } = updateBody.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "Error while updating information",
    });
  }

  await User.updateOne({ _id: req.userId }, req.body);

  res.json({
    message: "Updated Successfully",
  });
});

router.get("/bulk", authMiddleWare, async (req, res) => {
  const filter = req.query.filter || "";
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const users = await User.find({
    $or: [
      {
        firstName: {
          $regex: filter,
        },
      },
      {
        lastName: {
          $regex: filter,
        },
      },
    ],
  })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments({
    $or: [
      {
        firstName: {
          $regex: filter,
        },
      },
      {
        lastName: {
          $regex: filter,
        },
      },
    ],
  });

  res.json({
    user: users.map((user) => ({
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      _id: user._id,
    })),
    total,
    page,
    limit,
  });
});

export default router;
