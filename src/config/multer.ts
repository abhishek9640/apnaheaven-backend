import multer from "multer";
import path from "path";
import fs from "fs";

// Create uploads directories if they don't exist
const propertyUploadDir = "uploads/properties";
const locationUploadDir = "uploads/locations";

[propertyUploadDir, locationUploadDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Property storage
const propertyStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, propertyUploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "property-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// Location storage
const locationStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, locationUploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "location-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"));
  }
};

// Configure multer for properties
export const uploadProperty = multer({
  storage: propertyStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
  },
});

// Configure multer for locations
export const uploadLocation = multer({
  storage: locationStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
  },
});
