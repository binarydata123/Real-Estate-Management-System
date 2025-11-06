import express from "express";
import {
  createProperty,
  getProperties,
  getSingleProperty,
  updateProperty,
  deleteProperty
} from "../../../controllers/Agent/PropertyController.js";
import { createUpload } from "../../../utils/multerConfig.js";
import { protect } from "../../../middleware/authMiddleware.js";

const router = express.Router();

const upload = createUpload("Properties");


// Using a more RESTful approach for property routes.
// This assumes the router is mounted at a path like `/api/agent/properties`.

router.route("/")
  .get(protect(["admin", "agent"]), getProperties)
  .post(protect(["admin", "agent"]), upload.multiple("images", 10), createProperty);

router.route("/:id")
  .get(protect(["admin", "agent"]), getSingleProperty)
  .put(protect(["admin", "agent"]), upload.multiple("images", 10), updateProperty)
  .delete(protect(["admin", "agent"]), deleteProperty);

export default router;
