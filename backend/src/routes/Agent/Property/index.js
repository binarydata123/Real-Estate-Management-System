import express from "express";
import { createProperty } from "../../../controllers/Agent/PropertyController.js";
import { createUpload } from "../../../utils/multerConfig.js";
import { protect } from "../../../middleware/authMiddleware.js";

const router = express.Router();

const upload = createUpload("Properties");

// Create
router.post("/create", protect, upload.multiple("images", 10), createProperty);


export default router;
