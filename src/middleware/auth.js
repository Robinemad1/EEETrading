const jwt = require("jsonwebtoken");

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/request-password-reset",
  "/api/auth/reset-password",
  "/login",
  "/register",
  "/auth/reset-password",
  "/auth/request-password-reset",
  "/", // landing page
];

// Unified authentication middleware
const auth = (req, res, next) => {
  // Allow public routes
  if (PUBLIC_ROUTES.includes(req.path)) {
    return next();
  }

  const token = req.session?.token;

  if (!token) {
    // Handle API requests
    if (req.path.startsWith("/api/")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Please login.",
      });
    }
    // Handle view requests
    return res.redirect("/login");
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );
    req.user = decoded;
    next();
  } catch (error) {
    // Token is invalid or expired
    if (req.path.startsWith("/api/")) {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again.",
      });
    }
    // Clear invalid session and redirect to login
    req.session.destroy();
    res.redirect("/login");
  }
};

// Role-based authorization middleware
const authorize = (roles = []) => {
  if (typeof roles === "string") {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user) {
      if (req.path.startsWith("/api/")) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }
      return res.redirect("/login");
    }

    if (roles.length && !roles.includes(req.user.role)) {
      if (req.path.startsWith("/api/")) {
        return res.status(403).json({
          success: false,
          message: "Forbidden - insufficient permissions",
        });
      }
      return res.redirect("/"); // or to a custom 403 page
    }

    next();
  };
};

// Session status middleware for views
const setUserStatus = (req, res, next) => {
  if (req.user) {
    res.locals.isLoggedIn = true;
    res.locals.userEmail = req.user.email;
    res.locals.role = req.user.role;
  } else {
    res.locals.isLoggedIn = false;
    res.locals.userEmail = null;
    res.locals.role = null;
  }
  res.locals.cartLength = req.session.cart?.length || 0;
  res.locals.currentRoute = req.path;
  next();
};

// Cart initialization middleware
const initializeCart = (req, res, next) => {
  if (!req.session.cart) {
    req.session.cart = [];
  }
  next();
};

module.exports = {
  auth,
  authorize,
  setUserStatus,
  initializeCart,
};
