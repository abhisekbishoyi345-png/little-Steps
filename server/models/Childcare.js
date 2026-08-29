const mongoose = require("mongoose");

const pricingPlansSchema = new mongoose.Schema(
  {
    hourly: {
      type: Number,
      min: 0,
      default: null,
    },

    daily: {
      type: Number,
      min: 0,
      default: null,
    },

    monthly: {
      type: Number,
      min: 0,
      default: null,
    },
  },
  { _id: false }
);

const childcareSchema = new mongoose.Schema(
  {
    // =====================================
    // Basic Information
    // =====================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    ageGroup: {
      type: String,
      required: true,
      trim: true,
    },

    timing: {
      type: String,
      required: true,
      trim: true,
    },

    plan: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    image: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    // =====================================
    // Availability / Capacity
    // =====================================

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    availableSlots: {
      type: Number,
      required: true,
      min: 0,
    },

    is24x7: {
      type: Boolean,
      default: false,
    },

    availability: {
      type: String,
      enum: [
        "Available",
        "Limited",
        "Full",
        "Unavailable",
      ],
      default: "Available",
      trim: true,
    },

    // =====================================
    // Hourly / Daily / Monthly Plans
    // =====================================

    pricingPlans: {
      type: pricingPlansSchema,
      default: () => ({}),
    },

    // =====================================
    // Caregiver Profiles
    // =====================================

    caregivers: {
      type: [String],
      default: [],
    },

    // =====================================
    // Safety Measures
    // =====================================

    safetyMeasures: {
      type: [String],
      default: [],
    },

    // =====================================
    // Certifications
    // =====================================

    certifications: {
      type: [String],
      default: [],
    },

    // =====================================
    // Provider
    // =====================================

    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // =====================================
    // Provider Verification
    // =====================================

    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// =====================================
// Indexes
// =====================================

childcareSchema.index({
  name: "text",
  location: "text",
  ageGroup: "text",
  description: "text",
});

childcareSchema.index({
  location: 1,
  ageGroup: 1,
  availability: 1,
});

childcareSchema.index({
  price: 1,
});

module.exports = mongoose.model(
  "Childcare",
  childcareSchema
);