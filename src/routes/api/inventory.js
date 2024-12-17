const express = require("express");
const router = express.Router();
const { pool } = require("../../services/db");

// Get all inventory items
router.get("/quickbooks-inventory", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM inventory");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
});

// Get single inventory item
router.get("/quickbooks-inventory/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM inventory WHERE id = $1", [
      id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json({ item: result.rows[0] });
  } catch (error) {
    console.error("Error fetching inventory item:", error);
    res.status(500).json({ error: "Failed to fetch inventory item" });
  }
});

// Get image for inventory item
router.get("/image/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT image_url FROM inventory WHERE id = $1",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Image not found" });
    }
    res.json({ imageUrl: result.rows[0].image_url });
  } catch (error) {
    console.error("Error fetching image:", error);
    res.status(500).json({ error: "Failed to fetch image" });
  }
});

// Get all images
router.get("/images", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, image_url FROM inventory");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ error: "Failed to fetch images" });
  }
});

module.exports = router;
