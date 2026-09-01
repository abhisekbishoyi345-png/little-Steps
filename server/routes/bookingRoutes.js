const express = require("express");

const router = express.Router();

// ===============================
// Controllers
// ===============================

const {
  createBooking,
  getAllBookings,
  getParentBookings,
  getProviderBookings,
  updateBookingStatus,
  cancelBooking,
} = require("../controllers/bookingController");

// ===============================
// Authentication Middleware
// ===============================

const {
  authMiddleware,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// ===============================
// Create Booking
// Parent Only
// ===============================

router.post(
  "/create",
  authMiddleware,
  authorizeRoles("parent"),
  createBooking
);

// ===============================
// Get All Bookings
// Admin Only
// ===============================

router.get(
  "/",
  authMiddleware,
  authorizeRoles("admin"),
  getAllBookings
);

// ===============================
// Get Parent Bookings
// Parent Only
// ===============================
//
// Keeping :email preserves your
// existing frontend/API structure.
//
// The controller verifies that this
// email belongs to the logged-in parent.

router.get(
  "/parent/:email",
  authMiddleware,
  authorizeRoles("parent"),
  getParentBookings
);

// ===============================
// Get Provider Bookings
// Provider Only
// ===============================

router.get(
  "/provider",
  authMiddleware,
  authorizeRoles("provider"),
  getProviderBookings
);

// ===============================
// Update Booking Status
// Admin + Provider
// ===============================

router.put(
  "/:id/status",
  authMiddleware,
  authorizeRoles(
    "admin",
    "provider"
  ),
  updateBookingStatus
);

// ===============================
// Cancel / Delete Booking
// Parent + Admin
// ===============================

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles(
    "parent",
    "admin"
  ),
  cancelBooking
);

module.exports = router;