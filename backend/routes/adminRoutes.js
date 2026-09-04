const express = require("express");

const {
  getDashboardStats,
  getAllUsers,
  createUser,
  createStore,
  getAllStores,
  getUserDetails
} = require("../controllers/adminController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// ===============================
// ADMIN DASHBOARD
// ===============================
router.get(
  "/dashboard",
  authenticateToken,
  authorizeRoles("admin"),
  getDashboardStats
);

// ===============================
// GET ALL USERS
// ===============================
router.get(
  "/users",
  authenticateToken,
  authorizeRoles("admin"),
  getAllUsers
);

// ===============================
// GET USER DETAILS
// ===============================
router.get(
  "/users/:id",
  authenticateToken,
  authorizeRoles("admin"),
  getUserDetails
);

// ===============================
// CREATE USER
// ===============================
router.post(
  "/users",
  authenticateToken,
  authorizeRoles("admin"),
  createUser
);

// ===============================
// CREATE STORE
// ===============================
router.post(
  "/stores",
  authenticateToken,
  authorizeRoles("admin"),
  createStore
);

// ===============================
// GET ALL STORES
// ===============================
router.get(
  "/stores",
  authenticateToken,
  authorizeRoles("admin"),
  getAllStores
);

module.exports = router;