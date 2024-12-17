const express = require("express");
const router = express.Router();
const api = require("../../services/apiClient");
const { auth } = require("../../middleware/auth");

// Helper function for getting inventory data
const getInventory = async (session) => {
  try {
    return await api.inventory.getAll(session);
  } catch (error) {
    console.error("Error fetching inventory data:", error);
    throw new Error("Failed to fetch inventory data");
  }
};

// Single product view
router.get("/product/:id", auth, async (req, res) => {
  const { id } = req.params;
  try {
    const [product, image] = await Promise.all([
      api.inventory.getById(req.session, id),
      api.inventory.getImage(req.session, id),
    ]);

    res.render("pages/productview", {
      productItem: product,
      image: image,
    });
  } catch (error) {
    console.error("Error in API request:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Admin inventory management
router.get("/admin", auth, async (req, res) => {
  try {
    const allprod = await getInventory(req.session);
    res.render("pages/inventory", { allprod });
  } catch (error) {
    res.status(500).send("User is not logged in");
  }
});

module.exports = router;
