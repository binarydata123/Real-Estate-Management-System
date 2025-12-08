import express from "express";
import {
  getSharedProperties,
  updateSharedProperty,
  deleteSharedProperty,
  getPropertyFeedbackByPropertyId
} from "../../../controllers/Admin/SharedPropertiesController.js";
import { protect } from "../../../middleware/authMiddleware.js";

const router = express.Router();



// Using a more RESTful approach for property routes.
// This assumes the router is mounted at a path like `/api/agent/properties`.

router.get(
  "/get-all-shared-properties",
  protect(["admin", "agent", "customer"]),
  getSharedProperties
);

// Update
router.put(
  "/update/:id",
  protect(["admin", "agent", "customer"]),
  updateSharedProperty
);

// Delete
router.delete(
  "/delete/:id",
  protect(["admin", "agent", "customer"]),
  deleteSharedProperty
);

router.get(
  "/get-property-feedback-by-property-id/:id",
  protect(["admin", "agent", "customer"]),
  getPropertyFeedbackByPropertyId
);

export default router;