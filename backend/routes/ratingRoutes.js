const express = require("express");

const {
  createRating,
  updateRating
} = require("../controllers/ratingController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Create rating
router.post(
  "/",
  authenticateToken,
  authorizeRoles("user"),
  createRating
);

// Update rating
router.put(
  "/",
  authenticateToken,
  authorizeRoles("user"),
  updateRating
);

module.exports = router;