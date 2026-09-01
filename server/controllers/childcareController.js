const mongoose = require("mongoose");
const Childcare = require("../models/Childcare");

// =====================================
// Helper: Check Authentication
// =====================================

const checkProvider = (req, res) => {
  if (!req.user || !req.user.id) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });

    return false;
  }

  return true;
};

// =====================================
// Helper: Parse Array
// =====================================

const parseArray = (value) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      return [];
    }

    // JSON array support
    try {
      const parsed = JSON.parse(trimmed);

      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => String(item).trim())
          .filter(Boolean);
      }
    } catch (error) {
      // Not JSON, continue
    }

    // Comma separated support
    return trimmed
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

// =====================================
// Helper: Parse Boolean
// =====================================

const parseBoolean = (value) => {
  if (
    value === true ||
    value === "true" ||
    value === "1" ||
    value === 1
  ) {
    return true;
  }

  if (
    value === false ||
    value === "false" ||
    value === "0" ||
    value === 0
  ) {
    return false;
  }

  return undefined;
};

// =====================================
// Helper: Valid ObjectId
// =====================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// =====================================
// Helper: Parse Number
// =====================================

const parseNumber = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return undefined;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : undefined;
};

// =====================================
// Helper: Parse Pricing Plans
// =====================================

const parsePricingPlans = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return {};
  }

  if (typeof value === "object") {
    return value;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (
        parsed &&
        typeof parsed === "object" &&
        !Array.isArray(parsed)
      ) {
        return parsed;
      }
    } catch (error) {
      return null;
    }
  }

  return null;
};

// =====================================
// ADD CHILDCARE
// POST /api/childcare/add
// Provider Only
// =====================================

exports.addChildcare = async (req, res) => {
  try {
    if (!checkProvider(req, res)) {
      return;
    }

    const {
      name,
      location,
      ageGroup,
      timing,
      plan,
      price,
      description,
      capacity,
      availableSlots,
      is24x7,
      availability,
      hourly,
      daily,
      monthly,
      pricingPlans,
      caregivers,
      safetyMeasures,
      certifications,
    } = req.body;

    // =====================================
    // Required Fields
    // =====================================

    if (
      !name?.trim() ||
      !location?.trim() ||
      !ageGroup?.trim() ||
      !timing?.trim() ||
      !plan?.trim() ||
      price === undefined ||
      price === "" ||
      !description?.trim() ||
      capacity === undefined ||
      capacity === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    // =====================================
    // Image Required
    // =====================================

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a childcare image",
      });
    }

    // =====================================
    // Validate Price
    // =====================================

    const numericPrice = parseNumber(price);

    if (
      numericPrice === undefined ||
      numericPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid price",
      });
    }

    // =====================================
    // Validate Capacity
    // =====================================

    const numericCapacity = parseNumber(capacity);

    if (
      numericCapacity === undefined ||
      numericCapacity < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Capacity must be at least 1",
      });
    }

    // =====================================
    // Available Slots
    // =====================================

    const numericAvailableSlots =
      availableSlots === undefined ||
      availableSlots === ""
        ? numericCapacity
        : parseNumber(availableSlots);

    if (
      numericAvailableSlots === undefined ||
      numericAvailableSlots < 0 ||
      numericAvailableSlots > numericCapacity
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Available slots must be between 0 and capacity",
      });
    }

    // =====================================
    // Pricing Plans
    // =====================================

    let finalPricingPlans =
      parsePricingPlans(pricingPlans);

    if (finalPricingPlans === null) {
      return res.status(400).json({
        success: false,
        message: "Invalid pricingPlans format",
      });
    }

    // Direct hourly
    if (hourly !== undefined && hourly !== "") {
      const value = parseNumber(hourly);

      if (value === undefined || value < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid hourly price",
        });
      }

      finalPricingPlans.hourly = value;
    }

    // Direct daily
    if (daily !== undefined && daily !== "") {
      const value = parseNumber(daily);

      if (value === undefined || value < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid daily price",
        });
      }

      finalPricingPlans.daily = value;
    }

    // Direct monthly
    if (monthly !== undefined && monthly !== "") {
      const value = parseNumber(monthly);

      if (value === undefined || value < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid monthly price",
        });
      }

      finalPricingPlans.monthly = value;
    }

    // =====================================
    // 24x7
    // =====================================

    const parsed24x7 = parseBoolean(is24x7);

    // =====================================
    // Create Childcare
    // =====================================

    const childcare = await Childcare.create({
      name: name.trim(),
      location: location.trim(),
      ageGroup: ageGroup.trim(),
      timing: timing.trim(),
      plan: plan.trim(),

      price: numericPrice,

      image: `/uploads/${req.file.filename}`,

      description: description.trim(),

      capacity: numericCapacity,

      availableSlots: numericAvailableSlots,

      is24x7:
        parsed24x7 !== undefined
          ? parsed24x7
          : false,

      availability:
        availability || "Available",

      pricingPlans: finalPricingPlans,

      caregivers:
        parseArray(caregivers) || [],

      safetyMeasures:
        parseArray(safetyMeasures) || [],

      certifications:
        parseArray(certifications) || [],

      providerId: req.user.id,

      // New providers are not verified automatically
      verified: false,
    });

    // =====================================
    // Populate Provider
    // =====================================

    const populatedChildcare =
      await Childcare.findById(childcare._id)
        .populate(
          "providerId",
          "fullName email"
        );

    return res.status(201).json({
      success: true,
      message: "Childcare Added Successfully",
      childcare: populatedChildcare,
    });
  } catch (error) {
    console.error(
      "Add childcare error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// GET ALL CHILDCARE
// GET /api/childcare
// Public
// Search + Filters
// =====================================

exports.getAllChildcare = async (req, res) => {
  try {
    const {
      search,
      location,
      ageGroup,
      is24x7,
      availability,
      plan,
      minPrice,
      maxPrice,
      minCapacity,
      verified,
    } = req.query;

    const filter = {};

    // =====================================
    // Search
    // =====================================

    if (search && search.trim()) {
      const searchValue = search.trim();

      filter.$or = [
        {
          name: {
            $regex: searchValue,
            $options: "i",
          },
        },
        {
          location: {
            $regex: searchValue,
            $options: "i",
          },
        },
        {
          ageGroup: {
            $regex: searchValue,
            $options: "i",
          },
        },
        {
          description: {
            $regex: searchValue,
            $options: "i",
          },
        },
      ];
    }

    // =====================================
    // Location
    // =====================================

    if (location && location.trim()) {
      filter.location = {
        $regex: location.trim(),
        $options: "i",
      };
    }

    // =====================================
    // Age Group
    // =====================================

    if (ageGroup && ageGroup.trim()) {
      filter.ageGroup = {
        $regex: ageGroup.trim(),
        $options: "i",
      };
    }

    // =====================================
    // 24x7
    // =====================================

    if (is24x7 !== undefined) {
      const parsed = parseBoolean(is24x7);

      if (parsed !== undefined) {
        filter.is24x7 = parsed;
      }
    }

    // =====================================
    // Availability
    // =====================================

    if (availability) {
      filter.availability = availability;
    }

    // =====================================
    // Plan
    // =====================================

    if (plan && plan.trim()) {
      filter.plan = {
        $regex: plan.trim(),
        $options: "i",
      };
    }

    // =====================================
    // Price
    // =====================================

    const numericMinPrice =
      parseNumber(minPrice);

    const numericMaxPrice =
      parseNumber(maxPrice);

    if (
      numericMinPrice !== undefined ||
      numericMaxPrice !== undefined
    ) {
      filter.price = {};

      if (numericMinPrice !== undefined) {
        filter.price.$gte = numericMinPrice;
      }

      if (numericMaxPrice !== undefined) {
        filter.price.$lte = numericMaxPrice;
      }
    }

    // =====================================
    // Capacity
    // =====================================

    const numericMinCapacity =
      parseNumber(minCapacity);

    if (numericMinCapacity !== undefined) {
      filter.capacity = {
        $gte: numericMinCapacity,
      };
    }

    // =====================================
    // Verification
    // =====================================

    if (verified !== undefined) {
      const parsed = parseBoolean(verified);

      if (parsed !== undefined) {
        filter.verified = parsed;
      }
    }

    // =====================================
    // Fetch
    // =====================================

    const childcare =
      await Childcare.find(filter)
        .populate(
          "providerId",
          "fullName email"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      total: childcare.length,
      childcare,
    });
  } catch (error) {
    console.error(
      "Get all childcare error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// GET SINGLE CHILDCARE
// GET /api/childcare/:id
// Public
// =====================================

exports.getChildcareById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid childcare ID",
      });
    }

    const childcare =
      await Childcare.findById(id)
        .populate(
          "providerId",
          "fullName email"
        );

    if (!childcare) {
      return res.status(404).json({
        success: false,
        message:
          "Childcare Center Not Found",
      });
    }

    return res.status(200).json({
      success: true,
      childcare,
    });
  } catch (error) {
    console.error(
      "Get childcare by ID error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// GET MY CHILDCARE
// GET /api/childcare/my
// Provider Only
// =====================================

exports.getMyChildcare = async (
  req,
  res
) => {
  try {
    if (!checkProvider(req, res)) {
      return;
    }

    const childcare =
      await Childcare.find({
        providerId: req.user.id,
      })
        .populate(
          "providerId",
          "fullName email"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      total: childcare.length,
      childcare,
    });
  } catch (error) {
    console.error(
      "Get provider childcare error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// UPDATE CHILDCARE
// PUT /api/childcare/:id
// Provider Only
// Ownership Protected
// =====================================

exports.updateChildcare = async (
  req,
  res
) => {
  try {
    if (!checkProvider(req, res)) {
      return;
    }

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid childcare ID",
      });
    }

    // =====================================
    // Find Provider's Own Center
    // =====================================

    const childcare =
      await Childcare.findOne({
        _id: id,
        providerId: req.user.id,
      });

    if (!childcare) {
      return res.status(404).json({
        success: false,
        message:
          "Childcare Center Not Found or You are not the owner",
      });
    }

    // =====================================
    // Basic Fields
    // =====================================

    if (req.body.name !== undefined) {
      if (!String(req.body.name).trim()) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty",
        });
      }

      childcare.name =
        String(req.body.name).trim();
    }

    if (
      req.body.location !== undefined
    ) {
      if (
        !String(req.body.location).trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Location cannot be empty",
        });
      }

      childcare.location =
        String(req.body.location).trim();
    }

    if (
      req.body.ageGroup !== undefined
    ) {
      childcare.ageGroup =
        String(req.body.ageGroup).trim();
    }

    if (
      req.body.timing !== undefined
    ) {
      childcare.timing =
        String(req.body.timing).trim();
    }

    if (req.body.plan !== undefined) {
      childcare.plan =
        String(req.body.plan).trim();
    }

    if (
      req.body.description !== undefined
    ) {
      childcare.description =
        String(req.body.description).trim();
    }

    // =====================================
    // Price
    // =====================================

    if (
      req.body.price !== undefined &&
      req.body.price !== ""
    ) {
      const newPrice =
        parseNumber(req.body.price);

      if (
        newPrice === undefined ||
        newPrice < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid price",
        });
      }

      childcare.price = newPrice;
    }

    // =====================================
    // 24x7
    // =====================================

    if (
      req.body.is24x7 !== undefined
    ) {
      const parsed =
        parseBoolean(req.body.is24x7);

      if (parsed !== undefined) {
        childcare.is24x7 = parsed;
      }
    }

    // =====================================
    // Availability
    // =====================================

    if (
      req.body.availability !==
      undefined
    ) {
      const allowedStatuses = [
        "Available",
        "Limited",
        "Full",
        "Unavailable",
      ];

      if (
        !allowedStatuses.includes(
          req.body.availability
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid availability status",
        });
      }

      childcare.availability =
        req.body.availability;
    }

    // =====================================
    // Capacity
    // =====================================

    if (
      req.body.capacity !== undefined &&
      req.body.capacity !== ""
    ) {
      const newCapacity =
        parseNumber(req.body.capacity);

      if (
        newCapacity === undefined ||
        newCapacity < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Capacity must be at least 1",
        });
      }

      childcare.capacity =
        newCapacity;

      // Keep slots valid
      if (
        childcare.availableSlots >
        newCapacity
      ) {
        childcare.availableSlots =
          newCapacity;
      }
    }

    // =====================================
    // Available Slots
    // =====================================

    if (
      req.body.availableSlots !==
        undefined &&
      req.body.availableSlots !== ""
    ) {
      const newSlots =
        parseNumber(
          req.body.availableSlots
        );

      if (
        newSlots === undefined ||
        newSlots < 0 ||
        newSlots > childcare.capacity
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Available slots must be between 0 and capacity",
        });
      }

      childcare.availableSlots =
        newSlots;
    }

    // =====================================
    // Pricing Plans
    // =====================================

    let pricingPlans = {};

    if (childcare.pricingPlans) {
      pricingPlans =
        childcare.pricingPlans.toObject
          ? childcare.pricingPlans.toObject()
          : {
              ...childcare.pricingPlans,
            };
    }

    if (
      req.body.pricingPlans !== undefined
    ) {
      const parsed =
        parsePricingPlans(
          req.body.pricingPlans
        );

      if (parsed === null) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid pricingPlans format",
        });
      }

      pricingPlans = {
        ...pricingPlans,
        ...parsed,
      };
    }

    // Hourly
    if (
      req.body.hourly !== undefined &&
      req.body.hourly !== ""
    ) {
      const value =
        parseNumber(req.body.hourly);

      if (
        value === undefined ||
        value < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid hourly price",
        });
      }

      pricingPlans.hourly = value;
    }

    // Daily
    if (
      req.body.daily !== undefined &&
      req.body.daily !== ""
    ) {
      const value =
        parseNumber(req.body.daily);

      if (
        value === undefined ||
        value < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid daily price",
        });
      }

      pricingPlans.daily = value;
    }

    // Monthly
    if (
      req.body.monthly !== undefined &&
      req.body.monthly !== ""
    ) {
      const value =
        parseNumber(req.body.monthly);

      if (
        value === undefined ||
        value < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid monthly price",
        });
      }

      pricingPlans.monthly = value;
    }

    childcare.pricingPlans =
      pricingPlans;

    // =====================================
    // Caregivers
    // =====================================

    if (
      req.body.caregivers !== undefined
    ) {
      childcare.caregivers =
        parseArray(
          req.body.caregivers
        ) || [];
    }

    // =====================================
    // Safety Measures
    // =====================================

    if (
      req.body.safetyMeasures !==
      undefined
    ) {
      childcare.safetyMeasures =
        parseArray(
          req.body.safetyMeasures
        ) || [];
    }

    // =====================================
    // Certifications
    // =====================================

    if (
      req.body.certifications !==
      undefined
    ) {
      childcare.certifications =
        parseArray(
          req.body.certifications
        ) || [];
    }

    // =====================================
    // New Image
    // =====================================

    if (req.file) {
      childcare.image =
        `/uploads/${req.file.filename}`;
    }

    // =====================================
    // Save
    // =====================================

    const updatedChildcare =
      await childcare.save();

    const populatedChildcare =
      await Childcare.findById(
        updatedChildcare._id
      ).populate(
        "providerId",
        "fullName email"
      );

    return res.status(200).json({
      success: true,
      message:
        "Childcare Updated Successfully",
      childcare: populatedChildcare,
    });
  } catch (error) {
    console.error(
      "Update childcare error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// DELETE CHILDCARE
// DELETE /api/childcare/:id
// Provider Only
// Ownership Protected
// =====================================

exports.deleteChildcare = async (
  req,
  res
) => {
  try {
    if (!checkProvider(req, res)) {
      return;
    }

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid childcare ID",
      });
    }

    // =====================================
    // Find Provider's Own Center
    // =====================================

    const childcare =
      await Childcare.findOne({
        _id: id,
        providerId: req.user.id,
      });

    if (!childcare) {
      return res.status(404).json({
        success: false,
        message:
          "Childcare Center Not Found or You are not the owner",
      });
    }

    await Childcare.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message:
        "Childcare Deleted Successfully",
    });
  } catch (error) {
    console.error(
      "Delete childcare error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};