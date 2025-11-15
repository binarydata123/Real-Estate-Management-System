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
router.get("/:id", protect(["customer"]), getSingleProperty);

export default router;
