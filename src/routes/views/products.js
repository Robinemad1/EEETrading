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

// All products page
router.get("/", auth, async (req, res) => {
  try {
    const [allprod, images] = await Promise.all([
      getInventory(req.session),
      api.inventory.getAllImages(req.session),
    ]);
    res.render("pages/all", { allprod, images });
  } catch (error) {
    console.error("Error fetching products", error);
    res.status(500).send("Internal Server Error");
  }
});

// Search products
router.get("/search", auth, async (req, res) => {
  try {
    const searchQuery = req.query.search;
    const [allprod, images] = await Promise.all([
      getInventory(req.session),
      api.inventory.getAllImages(req.session),
    ]);
    res.render("pages/search", {
      allprod,
      images,
      searchQuery,
    });
  } catch (error) {
    console.error("Error fetching products", error);
    res.status(500).send("Internal Server Error");
  }
});

// Charcoal products
router.get("/charcoal", auth, async (req, res) => {
  try {
    const [allprod, images] = await Promise.all([
      getInventory(req.session),
      api.inventory.getAllImages(req.session),
    ]);
    res.render("pages/charcoal", { allprod, images });
  } catch (error) {
    console.error("Error fetching products", error);
    res.status(500).send("Internal Server Error");
  }
});

// Accessories products
router.get("/accessories", auth, async (req, res) => {
  try {
    const [allprod, images] = await Promise.all([
      getInventory(req.session),
      api.inventory.getAllImages(req.session),
    ]);
    res.render("pages/accessories", { allprod, images });
  } catch (error) {
    console.error("Error fetching products", error);
    res.status(500).send("Internal Server Error");
  }
});

// Hookahs products
router.get("/hookahs", auth, async (req, res) => {
  try {
    const [allprod, images] = await Promise.all([
      getInventory(req.session),
      api.inventory.getAllImages(req.session),
    ]);
    res.render("pages/hookah", { allprod, images });
  } catch (error) {
    console.error("Error fetching products", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
