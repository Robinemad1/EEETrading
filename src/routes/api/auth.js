const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { pool } = require("../../services/db");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { auth } = require("../../middleware/auth");

// Register endpoint
router.post("/register", async (req, res) => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    return res.status(400).json({
      success: false,
      message: "Email, password, and username are required",
    });
  }

  try {
    // Check if user already exists
    const userExists = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (userExists.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (email, password, username, role) VALUES ($1, $2, $3, $4) RETURNING id, email, username, role",
      [email, hashedPassword, username, "user"]
    );

    res.status(201).json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Login endpoint
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  try {
    // Find user
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    // Store token in session
    req.session.token = token;

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Logout endpoint
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({
        success: false,
        message: "Error logging out",
      });
    }
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  });
});

// Password reset request endpoint
router.post("/request-password-reset", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  try {
    // Check if user exists
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length === 0) {
      // For security reasons, don't reveal if user exists
      return res.json({
        success: true,
        message: "If an account exists, a password reset email will be sent",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token
    await pool.query(
      "UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3",
      [resetToken, resetTokenExpiry, email]
    );

    // Send email with reset link
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetLink = `/auth/reset-password?token=${resetToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 1 hour.`,
    });

    res.json({
      success: true,
      message: "If an account exists, a password reset email will be sent",
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Password reset endpoint
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Token and new password are required",
    });
  }

  try {
    // Find user with valid reset token
    const result = await pool.query(
      "SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()",
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Hash new password and update user
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
      "UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE reset_token = $2",
      [hashedPassword, token]
    );

    res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Get current user
router.get("/me", auth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, username, role FROM users WHERE id = $1",
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
