const express = require("express");
const router = express.Router();
const api = require("../../services/apiClient");
const { auth } = require("../../middleware/auth");

// Helper functions
const getInvoice = async (session) => {
  try {
    return await api.invoices.getAll(session);
  } catch (error) {
    console.error("Error fetching invoice data:", error);
    throw new Error("Failed to fetch invoice data");
  }
};

const getUsers = async (session) => {
  try {
    return await api.users.getAll(session);
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw new Error("Failed to fetch user data");
  }
};

// View all invoices
router.get("/invoices", auth, async (req, res) => {
  try {
    const invoiceData = await getInvoice(req.session);
    res.render("pages/invoices", { invoiceData });
  } catch (error) {
    res.status(500).send("User is not logged in");
  }
});

// Manage single invoice
router.get("/invoices/manage/:id", auth, async (req, res) => {
  const { id } = req.params;
  try {
    const invoiceData = await api.invoices.getById(req.session, id);
    res.render("pages/invoicemanage", { invoiceData });
  } catch (error) {
    console.error("Error in API request:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Update invoice status
router.patch("/invoices/manage/:id", auth, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await api.invoices.updateStatus(req.session, id, status);
    setTimeout(() => res.redirect(`/admin/invoices/manage/${id}`), 1000);
  } catch (error) {
    console.error("Error updating invoice status:", error);
    res.status(500).send("Failed to update invoice status");
  }
});

// View all users
router.get("/users", auth, async (req, res) => {
  try {
    const userData = await getUsers(req.session);
    res.render("pages/users", { userData });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
