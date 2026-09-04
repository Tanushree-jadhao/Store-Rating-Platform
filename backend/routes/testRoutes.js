const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/test-protected", authenticateToken, (req, res) => {
  res.json({
    message: "Protected route working!",
    user: req.user
  });
});

module.exports = router;