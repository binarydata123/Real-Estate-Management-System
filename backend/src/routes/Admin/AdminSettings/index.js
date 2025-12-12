import express from "express";
import { saveAdminSettings, getAdminSettings } from "../../../controllers/Admin/AdminSettingsController.js";
import { protect } from "../../../middleware/authMiddleware.js";
import { createUpload } from "../../../utils/multerConfig.js";
// import { uploadLogoImg } from "../../../middleware/uploadLogoMiddleware.js";

const uploadAdminSettings = createUpload({
  logoUrl: "logo",
  faviconUrl: "favicon",
});

const router = express.Router();

router.get("/", protect(["admin", "agent", "customer"]), getAdminSettings);
router.post(
  "/saveAdminSettings",
  uploadAdminSettings.fields([
    { name: "logoUrl", maxCount: 1 },
    { name: "faviconUrl", maxCount: 1 },
  ]),
  saveAdminSettings
);

export default router;
