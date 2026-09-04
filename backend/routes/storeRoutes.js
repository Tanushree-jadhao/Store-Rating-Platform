const express = require("express");

const {
  getAllStores
} = require("../controllers/storeController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  getAllStores
);

module.exports = router;