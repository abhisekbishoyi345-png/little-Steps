const multer = require("multer");
const path = require("path");
const fs = require("fs");

// =====================================
// Upload Directory
// =====================================

const uploadDir = path.join(__dirname, "../uploads");

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}

// =====================================
// Storage Configuration
// =====================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      extension;

    cb(null, uniqueName);
  },
});

// =====================================
// File Filter
// =====================================

const fileFilter = (req, file, cb) => {
  const allowedExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
  ];

  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  const isExtensionAllowed =
    allowedExtensions.includes(extension);

  const isMimeTypeAllowed =
    allowedMimeTypes.includes(file.mimetype);

  if (
    isExtensionAllowed &&
    isMimeTypeAllowed
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, JPEG, PNG and WEBP images are allowed"
      )
    );
  }
};

// =====================================
// Multer Configuration
// =====================================

const upload = multer({
  storage: storage,

  fileFilter: fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

// =====================================
// Export
// =====================================

module.exports = upload;