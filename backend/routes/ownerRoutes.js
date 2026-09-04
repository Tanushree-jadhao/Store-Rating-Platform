const express = require("express");

const {
  getOwnerDashboard
} = require("../controllers/ownerController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/dashboard",
  authenticateToken,
  authorizeRoles("owner"),
  getOwnerDashboard
);

module.exports = router;