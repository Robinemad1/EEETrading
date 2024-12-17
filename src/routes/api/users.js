const express = require("express");
const router = express.Router();
const { pool } = require("../../services/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Get all users
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, username, role, created_at FROM users"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get single user
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT id, email, username, role, created_at FROM users WHERE id = $1",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Create new user
router.post("/", async (req, res) => {
  const { email, password, username, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (email, password, username, role) VALUES ($1, $2, $3, $4) RETURNING id, email, username, role",
      [email, hashedPassword, username, role || "user"]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Update user
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { email, username, role } = req.body;
  try {
    const result = await pool.query(
      "UPDATE users SET email = $1, username = $2, role = $3 WHERE id = $4 RETURNING id, email, username, role",
      [email, username, role, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Delete user
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

module.exports = router;
