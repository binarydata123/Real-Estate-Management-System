import express from "express";
import {
  getProperties,
  updateProperty,
  deleteProperty
} from "../../../controllers/Admin/PropertyController.js";
import { createUpload } from "../../../utils/multerConfig.js";
import { protect } from "../../../middleware/authMiddleware.js";

const router = express.Router();

const upload = createUpload("Properties");


// Using a more RESTful approach for property routes.
// This assumes the router is mounted at a path like `/api/agent/properties`.

router.get(
  "/get-all-properties",
  protect(["admin", "agent", "customer"]),
  getProperties
);

// Update
router.put(
  "/update/:id",
  protect(["admin", "agent", "customer"]),
  updateProperty
);

// Delete
router.delete(
  "/delete/:id",
  protect(["admin", "agent", "customer"]),
  deleteProperty
);

export default router;