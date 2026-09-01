const jwt = require("jsonwebtoken");

// =====================================
// Authentication Middleware
// =====================================
// Checks whether the user has a valid JWT token

const authMiddleware = (req, res, next) => {
  try {
    // Get Authorization header
    const authHeader = req.headers.authorization;

    // Check Authorization header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please login.",
      });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    // Check token
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token missing.",
      });
    }

    // Check JWT secret
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in .env");

      return res.status(500).json({
        success: false,
        message: "JWT_SECRET is not configured",
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Save decoded user information
    req.user = decoded;

    // Continue to next middleware/controller
    next();
  } catch (error) {
    console.error(
      "Authentication middleware error:",
      error.message
    );

    // Token expired
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      });
    }

    // Invalid token
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please login again.",
      });
    }

    // Other errors
    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

// =====================================
// Role Authorization Middleware
// =====================================
// Allows only specified roles

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // User must be authenticated first
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Check user's role
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to perform this action",
      });
    }

    // Role is allowed
    next();
  };
};

// =====================================
// EXPORTS
// =====================================

module.exports = {
  authMiddleware,
  authorizeRoles,

  // Alias for compatibility
  protect: authMiddleware,
};