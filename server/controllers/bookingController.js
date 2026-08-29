const Booking = require("../models/Booking");
const Childcare = require("../models/Childcare");

// =====================================
// Helper: Update Availability
// =====================================

const calculateAvailability = (availableSlots, capacity) => {
  if (availableSlots <= 0) {
    return "Full";
  }

  if (
    capacity &&
    availableSlots <= Math.ceil(capacity * 0.2)
  ) {
    return "Limited";
  }

  return "Available";
};

// =====================================
// Helper: Release Childcare Slot
// =====================================

const releaseChildcareSlot = async (childcareId) => {
  const childcare = await Childcare.findOneAndUpdate(
    {
      _id: childcareId,
      $expr: {
        $lt: ["$availableSlots", "$capacity"],
      },
    },
    {
      $inc: {
        availableSlots: 1,
      },
    },
    {
      new: true,
    }
  );

  if (!childcare) {
    return null;
  }

  childcare.availability = calculateAvailability(
    childcare.availableSlots,
    childcare.capacity
  );

  await childcare.save();

  return childcare;
};

// =====================================
// Helper: Consume Childcare Slot
// =====================================

const consumeChildcareSlot = async (childcareId) => {
  const childcare = await Childcare.findOneAndUpdate(
    {
      _id: childcareId,
      availableSlots: {
        $gt: 0,
      },
    },
    {
      $inc: {
        availableSlots: -1,
      },
    },
    {
      new: true,
    }
  );

  if (!childcare) {
    return null;
  }

  childcare.availability = calculateAvailability(
    childcare.availableSlots,
    childcare.capacity
  );

  await childcare.save();

  return childcare;
};

// =====================================
// Create Booking
// Parent Only
// =====================================

exports.createBooking = async (req, res) => {
  try {
    const {
      parentName,
      email,
      mobile,
      childName,
      childAge,
      bookingDate,
      timing,
      specialRequest,
      childcareId,
    } = req.body;

    // ===============================
    // Required Fields
    // ===============================

    if (
      !parentName ||
      !email ||
      !mobile ||
      !childName ||
      childAge === undefined ||
      !bookingDate ||
      !timing ||
      !childcareId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please fill all required booking fields",
      });
    }

    // ===============================
    // Validate Parent Email
    // ===============================

    if (!req.user?.email) {
      return res.status(401).json({
        success: false,
        message:
          "Authenticated parent email is missing",
      });
    }

    // Prevent a parent from creating a booking
    // using another parent's email.
    if (
      email.trim().toLowerCase() !==
      req.user.email.trim().toLowerCase()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only create bookings using your own account.",
      });
    }

    // ===============================
    // Validate Child Age
    // ===============================

    const numericChildAge = Number(childAge);

    if (
      !Number.isFinite(numericChildAge) ||
      numericChildAge < 0 ||
      numericChildAge > 18
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Child age must be between 0 and 18.",
      });
    }

    // ===============================
    // Check Childcare Center
    // ===============================

    const childcare = await Childcare.findById(
      childcareId
    );

    if (!childcare) {
      return res.status(404).json({
        success: false,
        message: "Childcare Center Not Found",
      });
    }

    // ===============================
    // Check Availability
    // ===============================

    if (
      childcare.availableSlots <= 0 ||
      childcare.availability === "Full" ||
      childcare.availability === "Unavailable"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This childcare center currently has no available slots.",
      });
    }

    // ===============================
    // Create Booking
    // ===============================

    const booking = await Booking.create({
      parentName: parentName.trim(),

      email: req.user.email
        .trim()
        .toLowerCase(),

      mobile: mobile.trim(),

      childName: childName.trim(),

      childAge: numericChildAge,

      bookingDate,

      timing: timing.trim(),

      specialRequest:
        specialRequest?.trim() || "",

      childcareId,

      providerId: childcare.providerId || null,

      status: "Pending",
    });

    // ===============================
    // Populate Childcare
    // ===============================

    const populatedBooking =
      await Booking.findById(booking._id)
        .populate("childcareId")
        .populate("providerId");

    return res.status(201).json({
      success: true,
      message: "Booking Created Successfully",
      booking: populatedBooking,
    });
  } catch (error) {
    console.error(
      "Create booking error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// Get All Bookings
// Admin Only
// =====================================

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("childcareId")
      .populate("providerId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error(
      "Get all bookings error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// Get Parent Bookings
// Parent Only
// =====================================

exports.getParentBookings = async (req, res) => {
  try {
    // ===============================
    // Authentication Check
    // ===============================

    if (!req.user?.email) {
      return res.status(401).json({
        success: false,
        message:
          "Authenticated parent email is missing",
      });
    }

    const loggedInEmail = req.user.email
      .trim()
      .toLowerCase();

    // ===============================
    // Optional URL Email Validation
    // ===============================
    //
    // Keeps compatibility with:
    // /parent/:email
    //
    // But prevents one parent from
    // requesting another parent's bookings.

    const requestedEmail = req.params.email
      ?.trim()
      .toLowerCase();

    if (
      requestedEmail &&
      requestedEmail !== loggedInEmail
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to view these bookings.",
      });
    }

    // ===============================
    // Get Own Bookings Only
    // ===============================

    const bookings = await Booking.find({
      email: loggedInEmail,
    })
      .populate("childcareId")
      .populate("providerId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error(
      "Get parent bookings error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// Get Provider Bookings
// Provider Only
// =====================================

exports.getProviderBookings = async (req, res) => {
  try {
    const providerId = req.user.id;

    // ===============================
    // Get Provider Childcare Centers
    // ===============================

    const childcareCenters =
      await Childcare.find({
        providerId,
      }).select("_id");

    const childcareIds =
      childcareCenters.map(
        (center) => center._id
      );

    // ===============================
    // Get Only Provider Bookings
    // ===============================

    const bookings = await Booking.find({
      childcareId: {
        $in: childcareIds,
      },
    })
      .populate("childcareId")
      .populate("providerId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error(
      "Get provider bookings error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// Update Booking Status
// Admin + Provider
// =====================================

exports.updateBookingStatus = async (
  req,
  res
) => {
  try {
    const { status } = req.body;

    // ===============================
    // Validate Status
    // ===============================

    const validStatuses = [
      "Pending",
      "Accepted",
      "Rejected",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status",
      });
    }

    // ===============================
    // Find Booking
    // ===============================

    const booking = await Booking.findById(
      req.params.id
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // ===============================
    // Find Childcare
    // ===============================

    const childcare =
      await Childcare.findById(
        booking.childcareId
      );

    if (!childcare) {
      return res.status(404).json({
        success: false,
        message:
          "Childcare Center Not Found",
      });
    }

    // ===============================
    // Provider Authorization
    // ===============================

    if (req.user.role === "provider") {
      if (!childcare.providerId) {
        return res.status(403).json({
          success: false,
          message:
            "This childcare center is not assigned to a provider",
        });
      }

      if (
        childcare.providerId.toString() !==
        req.user.id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to update this booking",
        });
      }
    }

    // ===============================
    // Prevent Same Status
    // ===============================

    if (booking.status === status) {
      return res.status(400).json({
        success: false,
        message: `Booking is already ${status}`,
      });
    }

    const oldStatus = booking.status;

    // ===============================
    // Determine Slot Change
    // ===============================
    //
    // Not Accepted -> Accepted
    //     consume 1 slot
    //
    // Accepted -> Not Accepted
    //     release 1 slot
    //
    // Everything else
    //     no slot change

    const shouldConsumeSlot =
      oldStatus !== "Accepted" &&
      status === "Accepted";

    const shouldReleaseSlot =
      oldStatus === "Accepted" &&
      status !== "Accepted";

    // ===============================
    // ACCEPT / CONSUME SLOT
    // ===============================

    if (shouldConsumeSlot) {
      const updatedChildcare =
        await consumeChildcareSlot(
          booking.childcareId
        );

      if (!updatedChildcare) {
        return res.status(400).json({
          success: false,
          message:
            "No available slots remaining in this childcare center.",
        });
      }
    }

    // ===============================
    // RELEASE SLOT
    // ===============================

    if (shouldReleaseSlot) {
      await releaseChildcareSlot(
        booking.childcareId
      );
    }

    // ===============================
    // Update Booking
    // ===============================

    booking.status = status;

    await booking.save();

    // ===============================
    // Get Updated Booking
    // ===============================

    const updatedBooking =
      await Booking.findById(
        booking._id
      )
        .populate("childcareId")
        .populate("providerId");

    return res.status(200).json({
      success: true,
      message: `Booking ${status} Successfully`,
      booking: updatedBooking,
    });
  } catch (error) {
    console.error(
      "Update booking status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// Cancel / Delete Booking
// Parent + Admin
// =====================================

exports.cancelBooking = async (
  req,
  res
) => {
  try {
    const booking =
      await Booking.findById(
        req.params.id
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // ===============================
    // Parent Authorization
    // ===============================

    if (req.user.role === "parent") {
      if (!req.user.email) {
        return res.status(401).json({
          success: false,
          message:
            "Authenticated parent email is missing",
        });
      }

      if (
        booking.email.toLowerCase() !==
        req.user.email
          .trim()
          .toLowerCase()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to cancel this booking",
        });
      }
    }

    // ===============================
    // Release Slot If Accepted
    // ===============================

    if (booking.status === "Accepted") {
      await releaseChildcareSlot(
        booking.childcareId
      );
    }

    // ===============================
    // Delete Booking
    // ===============================

    await Booking.findByIdAndDelete(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message:
        "Booking Cancelled Successfully",
    });
  } catch (error) {
    console.error(
      "Cancel booking error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};