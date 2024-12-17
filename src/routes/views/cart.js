const express = require("express");
const router = express.Router();
const api = require("../../services/apiClient");
const { auth } = require("../../middleware/auth");

// View cart
router.get("/", auth, async (req, res) => {
  const items = req.session.cart || [];
  const images = await api.inventory.getAllImages(req.session);
  res.render("pages/cart", { items, images });
});

// Add to cart
router.post("/add", auth, async (req, res) => {
  const { id, quantity, name, price } = req.body;

  try {
    const product = await api.inventory.getById(req.session, id);

    if (product) {
      const quantityParsed = parseInt(quantity, 10);

      const existingItemIndex = req.session.cart.findIndex(
        (item) => item.id === id
      );
      if (existingItemIndex > -1) {
        req.session.cart[existingItemIndex].quantity += quantityParsed;
      } else {
        req.session.cart.push({
          id,
          name: product.item.name,
          price: product.item.unitPrice,
          quantity: quantityParsed,
        });
      }
      return res.redirect(`/inventory/product/${id}`);
    } else {
      return res
        .status(404)
        .json({ message: "Failed to fetch product details" });
    }
  } catch (error) {
    console.error("Error adding item to cart:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Update cart item quantity
router.put("/", auth, async (req, res) => {
  const { id, quantity } = req.body;

  try {
    const itemIndex = req.session.cart.findIndex((item) => item.id === id);
    if (itemIndex === -1) {
      return res.redirect("/cart");
    }
    req.session.cart[itemIndex].quantity = quantity;
    setTimeout(() => {
      res.redirect("/cart");
    }, 1000);
  } catch (error) {
    console.error("Error updating cart:", error.message);
    req.session.message = "Internal server error.";
    return res.redirect("/cart");
  }
});

// Place order
router.post("/order", auth, async (req, res) => {
  const { customer_name, customer_email, notes } = req.body;
  const items = JSON.parse(req.body.items);

  try {
    const response = await api.invoices.create(req.session, {
      customer_name,
      customer_email,
      items,
      notes,
    });

    if (response) {
      req.session.cart = [];
      return res.render("pages/thanks", {
        message: `Order created successfully. Thank you for inquiring about our products! We will reach out via email to ${customer_email}`,
      });
    } else {
      return res.status(500).json({ message: "Failed to create order" });
    }
  } catch (error) {
    console.error("Error creating order:", error.message);
    if (error.response) {
      return res.status(error.response.status).json({
        message: "Error creating order",
        error: error.response.data,
      });
    } else if (error.request) {
      return res
        .status(500)
        .json({ message: "No response received from server" });
    } else {
      return res.status(500).json({ message: "Error", error: error.message });
    }
  }
});

// Remove item from cart
router.post("/remove", auth, async (req, res) => {
  const { id } = req.body;
  try {
    const itemIndex = req.session.cart.findIndex((item) => item.id === id);
    if (itemIndex === -1) {
      req.session.message = "Item not found in cart.";
      return res.redirect("/home");
    }
    req.session.cart.splice(itemIndex, 1);
    req.session.message = "Item removed successfully.";
    return res.redirect("/cart");
  } catch (error) {
    console.error("Error removing item from cart:", error.message);
    req.session.message = "Internal server error.";
    return res.redirect("/cart");
  }
});

module.exports = router;
