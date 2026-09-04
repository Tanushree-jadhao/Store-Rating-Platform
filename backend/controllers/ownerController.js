const pool = require("../db/db");

const getOwnerDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        s.id AS store_id,
        s.name AS name,
        s.address,
        COUNT(r.id) AS total_ratings,
        COALESCE(ROUND(AVG(r.rating), 2), 0) AS average_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.owner_id = $1
      GROUP BY s.id, s.name, s.address
      `,
      [ownerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "No store assigned to this owner"
      });
    }

    const ratingsResult = await pool.query(
      `
      SELECT
        u.id AS id,
        u.name AS name,
        u.email,
        r.rating,
        r.created_at
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      JOIN stores s ON r.store_id = s.id
      WHERE s.owner_id = $1
      ORDER BY r.created_at DESC
      `,
      [ownerId]
    );

    res.json({
      store: result.rows[0],
      usersWhoRated: ratingsResult.rows
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch owner dashboard"
    });
  }
};

module.exports = {
  getOwnerDashboard
};