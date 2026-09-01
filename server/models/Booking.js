const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    // ===============================
    // Parent Information
    // ===============================

    parentName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    mobile: {
      type: String,
      required: true,
      trim: true,
    },

    // ===============================
    // Child Information
    // ===============================

    childName: {
      type: String,
      required: true,
      trim: true,
    },

    childAge: {
      type: Number,
      required: true,
      min: 0,
      max: 18,
    },

    // ===============================
    // Booking Information
    // ===============================

    bookingDate: {
      type: Date,
      required: true,
    },

    timing: {
      type: String,
      required: true,
      trim: true,
    },

    specialRequest: {
      type: String,
      default: "",
      trim: true,
    },

    // ===============================
    // Childcare Center
    // ===============================

    childcareId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Childcare",
      required: true,
      index: true,
    },

    // ===============================
    // Provider
    // ===============================

    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },

    // ===============================
    // Booking Status
    // ===============================

    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// ===============================
// Helpful Index
// ===============================

bookingSchema.index({
  childcareId: 1,
  bookingDate: 1,
  status: 1,
});

module.exports = mongoose.model("Booking", bookingSchema);