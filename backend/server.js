const express = require("express"); 
const cors = require("cors"); 
const pool = require("./db/db"); 
 
const authRoutes = require("./routes/authRoutes"); 
const adminRoutes = require("./routes/adminRoutes"); 
const testRoutes = require("./routes/testRoutes"); 
 const ownerRoutes = require("./routes/ownerRoutes");
 const storeRoutes = require("./routes/storeRoutes");
 const ratingRoutes = require("./routes/ratingRoutes");

const app = express(); 
 
app.use(cors()); 
app.use(express.json()); 
 
app.use("/api/auth", authRoutes); 
app.use("/api/admin", adminRoutes); 
app.use("/api/owner", ownerRoutes);
app.use("/api", testRoutes); 
app.use("/api/stores", storeRoutes);
app.use("/api/ratings", ratingRoutes);
 
app.get("/", (req, res) => { 
  res.json({ 
    message: "RateHub Backend is running!" 
  }); 
}); 
 
app.get("/api/test-db", async (req, res) => { 
  try { 
    const result = await pool.query("SELECT NOW()"); 
 
    res.json({ 
      message: "Database connected successfully!", 
      time: result.rows[0].now 
    }); 
  } catch (error) { 
    console.error(error); 
 
    res.status(500).json({ 
      message: "Database connection failed" 
    }); 
  } 
}); 
 
const PORT = 5000; 
 
app.listen(PORT, () => { 
  console.log(`Server running on http://localhost:${PORT}`); 
}); 