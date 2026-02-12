require("dotenv").config();
const cors = require("cors");
const express = require("express");
const userRoutes = require('./routes/users');
const initDb = require("./db/init");

const app = express();
app.use(cors());
app.use(express.json({ limit: process.env.JSON_LIMIT || "1mb" }));
// Routes
// https://localhost:3000/api/v1/users
app.use('/api/v1/users', userRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler (last)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);

  // Postgres error codes are useful, but don't leak internals to clients.
  // You can expand this mapping as needed.
  return res.status(500).json({ error: "Server error" });
});

// Start server
const PORT = Number(process.env.PORT) || 3000;
(async () => {
  try {
    await initDb();   // <-- Tables created here
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to initialize DB:", err);
    process.exit(1);
  }
})();