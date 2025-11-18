import express from "express";
import {
  getProperties,
  getAllSharedProperties,
  getSingleProperty,
} from "../../../controllers/Customer/PropertyController.js";
const router = express.Router();
import { protect } from "../../../middleware/authMiddleware.js";

router.get("/", protect(["customer"]), getProperties);
router.get("/getAllSharedProperties", getAllSharedProperties);
// Keep the router as is; params will still work
router.get("/:id", protect(["customer"]), getSingleProperty);

// Optional: also support POST for VAPI requests with body
router.post("/fetch", protect(["customer"]), getSingleProperty);
export default router;
