const pool = require("../db/db");

// Submit a new rating
const createRating = async (req, res) => {
  try {
    const { store_id, rating } = req.body;
    const user_id = req.user.id;

    // Validate rating
    if (!store_id || !rating) {
      return res.status(400).json({
        message: "Store ID and rating are required"
      });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be an integer between 1 and 5"
      });
    }

    // Check if store exists
    const storeResult = await pool.query(
      "SELECT id FROM stores WHERE id = $1",
      [store_id]
    );

    if (storeResult.rows.length === 0) {
      return res.status(404).json({
        message: "Store not found"
      });
    }

    // Insert rating
    const result = await pool.query(
      `INSERT INTO ratings (user_id, store_id, rating)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, store_id, rating, created_at`,
      [user_id, store_id, rating]
    );

    res.status(201).json({
      message: "Rating submitted successfully",
      rating: result.rows[0]
    });

  } catch (error) {
    console.error(error);

    // Duplicate rating
    if (error.code === "23505") {
      return res.status(400).json({
        message: "You have already rated this store"
      });
    }

    res.status(500).json({
      message: "Failed to submit rating"
    });
  }
};


// Edit an existing rating
const updateRating = async (req, res) => {
  try {
    const { store_id, rating } = req.body;
    const user_id = req.user.id;

    if (!store_id || !rating) {
      return res.status(400).json({
        message: "Store ID and rating are required"
      });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be an integer between 1 and 5"
      });
    }

    const result = await pool.query(
      `UPDATE ratings
       SET rating = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2
       AND store_id = $3
       RETURNING id, user_id, store_id, rating, updated_at`,
      [rating, user_id, store_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Rating not found"
      });
    }

    res.json({
      message: "Rating updated successfully",
      rating: result.rows[0]
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update rating"
    });
  }
};


module.exports = {
  createRating,
  updateRating
};