import { Router } from "express";
import LocationController from "../controllers/locationController.js";
import { verifyAdmin } from "../middleware/adminAuth.js";
import { uploadLocation } from "../config/multer.js";

const router = Router();

// Public routes
router.get("/", LocationController.getAllLocations.bind(LocationController));
router.get("/:id", LocationController.getLocationById.bind(LocationController));

// Protected routes (Admin only)
router.post(
  "/",
  verifyAdmin,
  uploadLocation.single("image"),
  LocationController.createLocation.bind(LocationController)
);

router.put(
  "/:id",
  verifyAdmin,
  uploadLocation.single("image"),
  LocationController.updateLocation.bind(LocationController)
);

router.delete(
  "/:id",
  verifyAdmin,
  LocationController.deleteLocation.bind(LocationController)
);

export default router;
