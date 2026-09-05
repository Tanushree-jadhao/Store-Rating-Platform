
const bcrypt = require("bcrypt");
const pool = require("../db/db");
const jwt = require("jsonwebtoken");

// ==================== SIGNUP ====================

const signup = async (req, res) => {
  try {
    const {
      name,
      email,
      address,
      password,
      role = "user",
    } = req.body;

    // Required fields
    if (!name || !email || !address || !password) {
      return res.status(400).json({
        message: "Name, email, address and password are required",
      });
    }

    // Allow all three account types
    if (!["user", "owner", "admin"].includes(role)) {
      return res.status(400).json({
        message: "Invalid account type",
      });
    }

    // Name validation
    const trimmedName = name.trim();

    if (trimmedName.length < 20 || trimmedName.length > 60) {
      return res.status(400).json({
        message: "Name must be between 20 and 60 characters",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = email.trim().toLowerCase();

    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    // Address validation
    const trimmedAddress = address.trim();

    if (trimmedAddress.length === 0) {
      return res.status(400).json({
        message: "Address is required",
      });
    }

    if (trimmedAddress.length > 400) {
      return res.status(400).json({
        message: "Address cannot exceed 400 characters",
      });
    }

    // Password validation
    // 8-16 characters
    // At least one uppercase letter
    // At least one special character
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be 8-16 characters with at least one uppercase letter and one special character",
      });
    }

    // Check existing email
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [trimmedEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      `INSERT INTO users
        (
          name,
          email,
          password_hash,
          address,
          role
        )
       VALUES
        ($1, $2, $3, $4, $5)
       RETURNING
        id,
        name,
        email,
        address,
        role`,
      [
        trimmedName,
        trimmedEmail,
        passwordHash,
        trimmedAddress,
        role,
      ]
    );

    res.status(201).json({
      message:
        role === "admin"
          ? "System Administrator registered successfully"
          : role === "owner"
          ? "Store Owner registered successfully"
          : "User registered successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Signup error:", error);

    res.status(500).json({
      message: "Signup failed",
    });
  }
};

// ==================== LOGIN ====================

const login = async (req, res) => {
  try {
    const {
      email,
      password,
      role,
    } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        message:
          "Email, password and login role are required",
      });
    }

    const allowedRoles = [
      "user",
      "admin",
      "owner",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid login role",
      });
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email.trim().toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (user.role !== role) {
      return res.status(403).json({
        message: `This account is not registered as ${role}`,
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      "ratehub_secret_key",
      {
        expiresIn: "1d",
      }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Login failed",
    });
  }
};

// ==================== CHANGE PASSWORD ====================

const changePassword = async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword,
    } = req.body;

    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message:
          "Current password and new password are required",
      });
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "New password must be 8-16 characters with at least one uppercase letter and one special character",
      });
    }

    const result = await pool.query(
      "SELECT password_hash FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const passwordMatch = await bcrypt.compare(
      currentPassword,
      result.rows[0].password_hash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Current password is incorrect",
      });
    }

    const newPasswordHash =
      await bcrypt.hash(newPassword, 10);

    await pool.query(
      `UPDATE users
       SET
        password_hash = $1,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [
        newPasswordHash,
        userId,
      ]
    );

    res.json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error(
      "Change password error:",
      error
    );

    res.status(500).json({
      message: "Failed to change password",
    });
  }
};

// ==================== EXPORTS ====================

module.exports = {
  signup,
  login,
  changePassword,
};