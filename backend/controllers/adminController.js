const pool = require("../db/db");
const bcrypt = require("bcrypt");

// ===============================
// ADMIN DASHBOARD
// ===============================
const getDashboardStats = async (req, res) => {
  try {
    const usersResult = await pool.query(
      "SELECT COUNT(*) FROM users"
    );

    const storesResult = await pool.query(
      "SELECT COUNT(*) FROM stores"
    );

    const ratingsResult = await pool.query(
      "SELECT COUNT(*) FROM ratings"
    );

    res.json({
      totalUsers: Number(usersResult.rows[0].count),
      totalStores: Number(storesResult.rows[0].count),
      totalRatings: Number(ratingsResult.rows[0].count)
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch dashboard statistics"
    });
  }
};


// ===============================
// GET ALL USERS
// ===============================
const getAllUsers = async (req, res) => {
  try {
    const { search, role, sortBy, order } = req.query;

    let query = `
      SELECT
        id,
        name,
        email,
        address,
        role,
        created_at
      FROM users
    `;

    const values = [];
    const conditions = [];

    if (search) {
      values.push(`%${search}%`);

      conditions.push(
        `(name ILIKE $${values.length}
        OR email ILIKE $${values.length})`
      );
    }

    if (role) {
      values.push(role);

      conditions.push(
        `role = $${values.length}`
      );
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    const allowedSortFields = [
      "id",
      "name",
      "email",
      "role",
      "created_at"
    ];

    const selectedSort = allowedSortFields.includes(sortBy)
      ? sortBy
      : "id";

    const selectedOrder =
      order === "desc" ? "DESC" : "ASC";

    query += ` ORDER BY ${selectedSort} ${selectedOrder}`;

    const result = await pool.query(query, values);

    res.json({
      users: result.rows
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch users"
    });
  }
};


// ===============================
// CREATE USER
// ===============================
const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      address,
      role
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Name, email, password and role are required"
      });
    }

    if (name.length < 20 || name.length > 60) {
      return res.status(400).json({
        message: "Name must be between 20 and 60 characters"
      });
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be 8-16 characters with at least one uppercase letter and one special character"
      });
    }

    if (!["user", "admin", "owner"].includes(role)) {
      return res.status(400).json({
        message: "Role must be user, admin or owner"
      });
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: "Email already registered"
      });
    }

    const passwordHash = await bcrypt.hash(
      password,
      10
    );

    const result = await pool.query(
      `INSERT INTO users
       (name, email, password_hash, address, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, address, role, created_at`,
      [
        name,
        email,
        passwordHash,
        address || null,
        role
      ]
    );

    res.status(201).json({
      message: "User created successfully",
      user: result.rows[0]
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create user"
    });
  }
};


// ===============================
// CREATE STORE
// ===============================
const createStore = async (req, res) => {
  try {
    const {
      name,
      address,
      owner_id
    } = req.body;

    if (!name || !address) {
      return res.status(400).json({
        message: "Store name and address are required"
      });
    }

    if (name.length < 20 || name.length > 60) {
      return res.status(400).json({
        message:
          "Store name must be between 20 and 60 characters"
      });
    }

    if (address.length > 400) {
      return res.status(400).json({
        message:
          "Address must not exceed 400 characters"
      });
    }

    if (owner_id) {
      const ownerResult = await pool.query(
        "SELECT id, role FROM users WHERE id = $1",
        [owner_id]
      );

      if (ownerResult.rows.length === 0) {
        return res.status(400).json({
          message: "Owner not found"
        });
      }

      if (ownerResult.rows[0].role !== "owner") {
        return res.status(400).json({
          message:
            "Selected user is not a store owner"
        });
      }
    }

    const result = await pool.query(
      `INSERT INTO stores
       (name, address, owner_id)
       VALUES ($1, $2, $3)
       RETURNING id, name, address, owner_id, created_at`,
      [
        name,
        address,
        owner_id || null
      ]
    );

    res.status(201).json({
      message: "Store created successfully",
      store: result.rows[0]
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create store"
    });
  }
};


// ===============================
// GET ALL STORES
// ===============================
const getAllStores = async (req, res) => {
  try {
    const { search, sortBy, order } = req.query;

    let query = `
      SELECT
        s.id,
        s.name,
        s.address,
        s.owner_id,
        u.name AS owner_name,
        u.email AS owner_email,

        COALESCE(
          ROUND(AVG(r.rating)::numeric, 2),
          0
        ) AS overall_rating

      FROM stores s

      LEFT JOIN users u
        ON s.owner_id = u.id

      LEFT JOIN ratings r
        ON s.id = r.store_id
    `;

    const values = [];
    const conditions = [];

    if (search) {
      values.push(`%${search}%`);

      conditions.push(`
        (
          s.name ILIKE $${values.length}
          OR s.address ILIKE $${values.length}
          OR u.name ILIKE $${values.length}
          OR u.email ILIKE $${values.length}
        )
      `);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += `
      GROUP BY
        s.id,
        s.name,
        s.address,
        s.owner_id,
        u.name,
        u.email
    `;

    const allowedSortFields = [
      "id",
      "name",
      "address",
      "overall_rating"
    ];

    const selectedSort = allowedSortFields.includes(sortBy)
      ? sortBy
      : "id";

    const selectedOrder =
      order === "desc" ? "DESC" : "ASC";

    query += `
      ORDER BY ${selectedSort} ${selectedOrder}
    `;

    const result = await pool.query(query, values);

    res.json({
      stores: result.rows
    });

  } catch (error) {
    console.error("GET ALL STORES ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch stores"
    });
  }
};


// ===============================
// GET USER DETAILS
// ===============================
const getUserDetails = async (req, res) => {
  try {
    const userId = req.params.id;

    const result = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        address,
        role,
        created_at
      FROM users
      WHERE id = $1
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json({
      user: result.rows[0]
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch user details"
    });
  }
};


// ===============================
// EXPORTS
// ===============================
module.exports = {
  getDashboardStats,
  getAllUsers,
  createUser,
  createStore,
  getAllStores,
  getUserDetails
};