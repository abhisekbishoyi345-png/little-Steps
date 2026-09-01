const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// ===============================
// Load Environment Variables
// ===============================

dotenv.config();

// ===============================
// Import Database Connection
// ===============================

const connectDB = require("./config/database");

// ===============================
// Import Routes
// ===============================

const authRoutes = require("./routes/authRoutes");
const childcareRoutes = require("./routes/childcareRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

// ===============================
// Initialize Express App
// ===============================

const app = express();

// ===============================
// Connect Database
// ===============================

connectDB();

// ===============================
// CORS Configuration
// ===============================

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",

  // Vercel frontend URL
  "https://client-three-ules-63.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin
      // such as Postman or server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error("Not allowed by CORS")
      );
    },

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],

    credentials: true,
  })
);

// ===============================
// Middleware
// ===============================

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// ===============================
// Serve Uploaded Images
// ===============================

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

// ===============================
// API Routes
// ===============================

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/childcare",
  childcareRoutes
);

app.use(
  "/api/booking",
  bookingRoutes
);

// ===============================
// Test Route
// ===============================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message:
      "Little Steps Backend Running Successfully",
  });
});

// ===============================
// Health Check Route
// ===============================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
  });
});

// ===============================
// Handle Unknown Routes
// ===============================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ===============================
// Global Error Handler
// ===============================

app.use((error, req, res, next) => {
  console.error("Server Error:", error.message);

  res.status(500).json({
    success: false,
    message:
      error.message ||
      "Internal Server Error",
  });
});

// ===============================
// Start Server
// ===============================

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 Server running on port ${PORT}`
  );

  console.log(
    `🌐 http://localhost:${PORT}`
  );
});