const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const connectDB = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const childcareRoutes = require("./routes/childcareRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

dotenv.config();

// ===============================
// Connect Database
// ===============================
connectDB();

const app = express();

// ===============================
// CORS
// ===============================
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://little-steps-phi.vercel.app",
      "https://client-three-ules-63.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ===============================
// Middleware
// ===============================
app.use(express.json());

// ===============================
// Serve Uploaded Images
// ===============================
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// ===============================
// Health Check
// ===============================
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is working",
  });
});

// ===============================
// API Routes
// ===============================
app.use("/api/auth", authRoutes);
app.use("/api/childcare", childcareRoutes);
app.use("/api/booking", bookingRoutes);

// ===============================
// Test Route
// ===============================
app.get("/", (req, res) => {
  res.send("Little Steps Backend Running Successfully");
});

// ===============================
// Port
// ===============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});