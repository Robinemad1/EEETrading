const express = require("express");
const router = express.Router();
const { pool } = require("../../services/db");

// Get all invoices
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM invoices ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

// Get single invoice
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM invoices WHERE id = $1", [
      id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching invoice:", error);
    res.status(500).json({ error: "Failed to fetch invoice" });
  }
});

// Create new invoice
router.post("/create", async (req, res) => {
  const { customer_name, customer_email, items, notes } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO invoices (customer_name, customer_email, items, notes, status) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [customer_name, customer_email, JSON.stringify(items), notes, "pending"]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error creating invoice:", error);
    res.status(500).json({ error: "Failed to create invoice" });
  }
});

// Update invoice status
router.patch("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const result = await pool.query(
      "UPDATE invoices SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating invoice status:", error);
    res.status(500).json({ error: "Failed to update invoice status" });
  }
});

module.exports = router;
