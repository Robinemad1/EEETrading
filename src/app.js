require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const methodOverride = require("method-override");
const { pool } = require("./services/db");
const { initializeAutomaticSync } = require("./services/sync");
const { auth, setUserStatus, initializeCart } = require("./middleware/auth");

// Import routes
const apiAuthRoutes = require("./routes/api/auth");
const apiInventoryRoutes = require("./routes/api/inventory");
const apiInvoiceRoutes = require("./routes/api/invoices");
const apiUserRoutes = require("./routes/api/users");

const viewAuthRoutes = require("./routes/views/auth");
const viewInventoryRoutes = require("./routes/views/inventory");
const viewCartRoutes = require("./routes/views/cart");
const viewAdminRoutes = require("./routes/views/admin");
const viewProductRoutes = require("./routes/views/products");

const app = express();

// Basic middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// View engine setup
app.set("view engine", "ejs");
app.use(express.static("public"));

// Add database pool to request
app.use((req, res, next) => {
  req.db = pool;
  next();
});

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === "production" }, // secure in production only
  })
);

// Authentication and session middleware
app.use(auth); // Protect all routes except public ones
app.use(setUserStatus);
app.use(initializeCart);

// API Routes
app.use("/api/auth", apiAuthRoutes);
app.use("/api/inventory", apiInventoryRoutes);
app.use("/api/invoices", apiInvoiceRoutes);
app.use("/api/users", apiUserRoutes);

// View Routes
app.use("/", viewAuthRoutes);
app.use("/inventory", viewInventoryRoutes);
app.use("/cart", viewCartRoutes);
app.use("/admin", viewAdminRoutes);
app.use("/products", viewProductRoutes);

// Initialize automatic sync
initializeAutomaticSync();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err.message,
  });
});

// Graceful shutdown
process.on("SIGINT", async () => {
  try {
    await pool.end();
    console.log("Database pool closed");
    process.exit(0);
  } catch (err) {
    console.error("Error closing pool:", err);
    process.exit(1);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
