const express = require("express");
const router = express.Router();
const api = require("../../services/apiClient");

// Auth middleware
const auth = (req, res, next) => {
  if (req.session && req.session.token) {
    next();
  } else {
    res.redirect("/");
  }
};

// Welcome page
router.get("/", (req, res) => {
  res.render("pages/welcome");
});

// Register page
router.get("/register", (req, res) => {
  res.render("pages/register", { errorMessage: null });
});

// Register form submission
router.post("/register", async (req, res) => {
  const { email, password, username } = req.body;
  try {
    const response = await api.auth.register({
      email,
      password,
      username,
    });

    if (response.success) {
      return res.redirect("/login");
    } else {
      return res.render("pages/register", {
        errorMessage: response.message,
      });
    }
  } catch (error) {
    return res.render("pages/register", {
      errorMessage: "Registration failed. Please try again.",
    });
  }
});

// Login page
router.get("/login", (req, res) => {
  res.render("pages/login", {
    email: "",
    auth: false,
    errorMessage: null,
  });
});

// Login form submission
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const response = await api.auth.login({
      email,
      password,
    });

    if (response.success) {
      req.session.token = response.token;
      req.session.email = response.user.email;
      req.session.role = response.user.role;
      return res.redirect("/home");
    } else {
      return res.render("pages/login", {
        email,
        auth: false,
        errorMessage: "Invalid credentials",
      });
    }
  } catch (error) {
    return res.render("pages/login", {
      email,
      auth: false,
      errorMessage: "Invalid Email or Password",
    });
  }
});

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.redirect("/home");
    }
    res.redirect("/login");
  });
});

// Password reset request page
router.get("/request-password-reset", (req, res) => {
  res.render("pages/request-password-reset", { message: null });
});

// Password reset page
router.get("/reset-password", (req, res) => {
  const token = req.query.token;
  if (!token) {
    return res.status(400).send("Token is required");
  }
  res.render("pages/reset-password", { token, message: null });
});

// Password reset form submission
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const response = await api.auth.resetPassword({
      token,
      newPassword,
    });

    if (response.success) {
      return res.render("pages/login", {
        message: "Password reset successful. Please login.",
        email: "",
        auth: false,
        errorMessage: null,
      });
    } else {
      return res.render("pages/reset-password", {
        message: response.message || "Password reset failed. Please try again.",
        token,
      });
    }
  } catch (error) {
    return res.render("pages/reset-password", {
      message:
        "An error occurred while resetting your password. Please try again.",
      token,
    });
  }
});

module.exports = router;
