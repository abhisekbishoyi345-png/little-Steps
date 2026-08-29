const express = require("express");

const router = express.Router();

const {
  addChildcare,
  getAllChildcare,
  getChildcareById,
  getMyChildcare,
  updateChildcare,
  deleteChildcare,
} = require("../controllers/childcareController");

const {
  authMiddleware,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// =====================================
// PROVIDER ROUTES
// =====================================

// GET MY CHILDCARE
// GET /api/childcare/my
router.get(
  "/my",
  authMiddleware,
  getMyChildcare
);

// ADD CHILDCARE
// POST /api/childcare/add
router.post(
  "/add",
  authMiddleware,
  upload.single("image"),
  addChildcare
);

// =====================================
// PUBLIC ROUTES
// =====================================

// GET ALL CHILDCARE
// GET /api/childcare
router.get(
  "/",
  getAllChildcare
);

// GET SINGLE CHILDCARE
// GET /api/childcare/:id
router.get(
  "/:id",
  getChildcareById
);

// =====================================
// PROVIDER UPDATE / DELETE
// =====================================

// UPDATE CHILDCARE
// PUT /api/childcare/:id
router.put(
  "/:id",
  authMiddleware,
  upload.single("image"),
  updateChildcare
);

// DELETE CHILDCARE
// DELETE /api/childcare/:id
router.delete(
  "/:id",
  authMiddleware,
  deleteChildcare
);

module.exports = router;