import { Router } from "express";
import PropertyController from "../controllers/propertyController.js";
import { verifyAuth } from "../middleware/auth.js";
import { verifyAdmin } from "../middleware/adminAuth.js";
import { upload } from "../config/multer.js";

const router = Router();

// Public routes
router.get("/", PropertyController.getAllProperties.bind(PropertyController));
router.get("/:id", PropertyController.getPropertyById.bind(PropertyController));

// Protected routes (Admin only)
router.post(
  "/",
  verifyAdmin,
  upload.array("images", 10),
  PropertyController.createProperty.bind(PropertyController)
);

router.put(
  "/:id",
  verifyAdmin,
  upload.array("images", 10),
  PropertyController.updateProperty.bind(PropertyController)
);

router.delete(
  "/:id",
  verifyAdmin,
  PropertyController.deleteProperty.bind(PropertyController)
);

router.delete(
  "/:id/image",
  verifyAdmin,
  PropertyController.deletePropertyImage.bind(PropertyController)
);

export default router;
