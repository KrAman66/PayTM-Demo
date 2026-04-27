import express from "express";
const router = express.Router();
import zod from "zod";
import { User, Account, RefreshToken, ResetToken } from "../db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { JWT_SECRET, REFRESH_TOKEN_SECRET } from "../config.js";
import { authMiddleWare } from "../middleware.js";
import crypto from "crypto";

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
      code: "VALIDATION_ERROR",
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
      code: "EMAIL_TAKEN",
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
    code: "SIGNUP_SUCCESS",
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
      code: "VALIDATION_ERROR",
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
      code: "INVALID_CREDENTIALS",
      message: "Invalid email or password",
    });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({
      code: "INVALID_CREDENTIALS",
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
    code: "SIGNIN_SUCCESS",
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
    return res.status(401).json({ code: "MISSING_TOKEN", message: "Refresh token required" });
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

    // Check if token exists in DB
    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!storedToken) {
      return res.status(401).json({ code: "INVALID_TOKEN", message: "Invalid refresh token" });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { userId: decoded.userId },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ code: "TOKEN_REFRESHED", accessToken });
  } catch (error) {
    return res.status(401).json({ code: "TOKEN_EXPIRED", message: "Invalid or expired refresh token" });
  }
});

// Get current user profile
router.get("/me", authMiddleWare, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.userId }).select("-password");
    if (!user) {
      return res.status(404).json({ code: "USER_NOT_FOUND", message: "User not found" });
    }
    res.json({
      code: "PROFILE_FETCHED",
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      _id: user._id
    });
  } catch (err) {
    res.status(500).json({ code: "PROFILE_FETCH_FAILED", message: "Failed to fetch profile" });
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
      code: "VALIDATION_ERROR",
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
    code: "UPDATE_SUCCESS",
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
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      errors
    });
  }

  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findOne({ _id: req.userId });
    if (!user) {
      return res.status(404).json({ code: "USER_NOT_FOUND", message: "User not found" });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ code: "INVALID_PASSWORD", message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.updateOne({ _id: req.userId }, { password: hashedPassword });

    res.json({ code: "PASSWORD_CHANGED", message: "Password changed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: "PASSWORD_CHANGE_FAILED", message: "Failed to change password" });
  }
});

// Request password reset (generates token - in production, send via email)
router.post("/request-password-reset", async (req, res) => {
  const schema = zod.object({
    username: zod.string().email({ message: "Invalid email format" }),
  });

  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.errors.map(error => ({
      field: error.path[0],
      message: error.message
    }));
    return res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      errors
    });
  }

  const { username } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      // Don't reveal user doesn't exist (security)
      return res.json({
        code: "RESET_REQUESTED",
        message: "If that email exists, a reset link has been sent"
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    // Invalidate old tokens for this user
    await ResetToken.deleteMany({ userId: user._id });

    // Save new token
    await ResetToken.create({
      token: resetToken,
      userId: user._id,
      expiresAt,
    });

    // In production: send email with reset link
    // For now, return token for testing (remove in production)
    res.json({
      code: "RESET_REQUESTED",
      message: "If that email exists, a reset link has been sent",
      // Include token in response for testing (remove in production)
      resetToken: process.env.NODE_ENV === "production" ? undefined : resetToken,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      code: "RESET_REQUEST_FAILED",
      message: "Failed to process reset request"
    });
  }
});

// Reset password with token
router.post("/reset-password", async (req, res) => {
  const schema = zod.object({
    token: zod.string().min(1, { message: "Reset token is required" }),
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
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      errors
    });
  }

  const { token, newPassword } = req.body;

  try {
    const resetRecord = await ResetToken.findOne({ token });
    if (!resetRecord) {
      return res.status(400).json({
        code: "INVALID_TOKEN",
        message: "Invalid or expired reset token"
      });
    }

    if (resetRecord.expiresAt < new Date()) {
      await ResetToken.deleteOne({ token });
      return res.status(400).json({
        code: "TOKEN_EXPIRED",
        message: "Reset token has expired"
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password
    await User.updateOne(
      { _id: resetRecord.userId },
      { password: hashedPassword }
    );

    // Invalidate reset token
    await ResetToken.deleteOne({ token });

    // Invalidate all refresh tokens for this user (force re-login)
    await RefreshToken.deleteMany({ userId: resetRecord.userId });

    res.json({
      code: "PASSWORD_RESET",
      message: "Password has been reset successfully"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      code: "RESET_FAILED",
      message: "Failed to reset password"
    });
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
    code: "USERS_FETCHED",
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
