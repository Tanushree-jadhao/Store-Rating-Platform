const pool = require("../db/db");

const getAllStores = async (req, res) => {
  try {
    const { search } = req.query;

    let query = `
      SELECT
        s.id,
        s.name,
        s.address,
        COALESCE(ROUND(AVG(r.rating), 2), 0) AS overall_rating,
        (
          SELECT r2.rating
          FROM ratings r2
          WHERE r2.store_id = s.id
          AND r2.user_id = $1
        ) AS user_rating
      FROM stores s
      LEFT JOIN ratings r
        ON s.id = r.store_id
    `;

    const values = [req.user.id];

    if (search) {
      values.push(`%${search}%`);

      query += `
        WHERE s.name ILIKE $2
        OR s.address ILIKE $2
      `;
    }

    query += `
      GROUP BY s.id, s.name, s.address
      ORDER BY s.name ASC
    `;

    const result = await pool.query(query, values);

    res.json({
      stores: result.rows
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch stores"
    });
  }
};

module.exports = {
  getAllStores
};