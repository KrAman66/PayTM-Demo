import express from "express";
const router = express.Router();
import zod from "zod";
import { User, Account, RefreshToken } from "../db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { JWT_SECRET, REFRESH_TOKEN_SECRET } from "../config.js";
import { authMiddleWare } from "../middleware.js";

const signUpSchema = zod.object({
  username: zod.string().email({ message: "Invalid email format" }),
  password: zod.string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" }),
  firstName: zod.string()
    .min(2, { message: "First name must be at least 2 characters long" })
    .max(50, { message: "First name must not exceed 50 characters" }),
  lastName: zod.string()
    .min(2, { message: "Last name must be at least 2 characters long" })
    .max(50, { message: "Last name must not exceed 50 characters" }),
});

const signInSchema = zod.object({
  username: zod.string().email({ message: "Invalid email format" }),
  password: zod.string().min(1, { message: "Password is required" }),
});

const updateBody = zod.object({
  password: zod.string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" })
    .optional(),
  firstName: zod.string()
    .min(2, { message: "First name must be at least 2 characters long" })
    .max(50, { message: "First name must not exceed 50 characters" })
    .optional(),
  lastName: zod.string()
    .min(2, { message: "Last name must be at least 2 characters long" })
    .max(50, { message: "Last name must not exceed 50 characters" })
    .optional(),
});

// Helper to generate tokens
function generateTokens(userId) {
  const accessToken = jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  const refreshToken = jwt.sign(
    { userId },
    REFRESH_TOKEN_SECRET,
    { expiresIn: "1y" }
  );

  return { accessToken, refreshToken };
}

router.post("/signup", async (req, res) => {
  const result = signUpSchema.safeParse(req.body);

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

  const { username, password, firstName, lastName } = req.body;

  const existingUser = await User.findOne({
    username,
  });

  if (existingUser) {
    return res.status(409).json({
      message: "Email already taken",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    password: hashedPassword,
    firstName,
    lastName,
  });

  const userId = user._id;

  await Account.create({
    userId,
    balance: 1 + Math.random() * 10000,
  });

  const { accessToken, refreshToken } = generateTokens(userId);

  // Store refresh token in DB
  await RefreshToken.create({
    token: refreshToken,
    userId,
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
  });

  res.json({
    message: "User created successfully",
    token: accessToken,
    refreshToken,
    firstName: user.firstName,
    lastName: user.lastName,
  });
});

router.post("/signin", async (req, res) => {
  const result = signInSchema.safeParse(req.body);

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

  const { username, password } = req.body;

  const user = await User.findOne({
    username,
  });

  if (!user) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  const { accessToken, refreshToken } = generateTokens(user._id);

  // Store refresh token in DB
  await RefreshToken.create({
    token: refreshToken,
    userId: user._id,
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
  });

  res.json({
    token: accessToken,
    refreshToken,
    firstName: user.firstName,
    lastName: user.lastName,
  });
});

// Refresh token endpoint
router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token required" });
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

    // Check if token exists in DB
    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!storedToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { userId: decoded.userId },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ accessToken });
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
});

// Get current user profile
router.get("/me", authMiddleWare, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.userId }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      _id: user._id
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

router.put("/", authMiddleWare, async (req, res) => {
  const result = updateBody.safeParse(req.body);
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

  // Hash password if it's being updated
  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
  }

  await User.updateOne({ _id: req.userId }, req.body);

  res.json({
    message: "Updated Successfully",
  });
});

// Change password endpoint
router.post("/change-password", authMiddleWare, async (req, res) => {
  const schema = zod.object({
    currentPassword: zod.string().min(1, { message: "Current password is required" }),
    newPassword: zod.string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      .regex(/[0-9]/, { message: "Password must contain at least one number" })
      .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" }),
  });

  const result = schema.safeParse(req.body);
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

  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findOne({ _id: req.userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.updateOne({ _id: req.userId }, { password: hashedPassword });

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to change password" });
  }
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