import express from "express";
import {
  getAdminProfile,
  updateAdminProfile
} from "../../../controllers/Admin/ProfileController.js";
import { protect } from "../../../middleware/authMiddleware.js";
import { uploadProfilePicture } from "../../../middleware/uploadMiddleware.js";

const router = express.Router();

router.get(
  "/get-admin-profile",
  protect(["admin", "agent", "customer"]),
  getAdminProfile
);

router.put("/update/:userId", protect(["admin", "agent", "customer"]), uploadProfilePicture.single("profilePictureUrl"), updateAdminProfile);

export default router;