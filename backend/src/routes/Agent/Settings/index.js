import express from "express";
import { getAgencySettings, updateAgencySettings } from "../../../controllers/Agent/SettingsController.js";
import { protect } from "../../../middleware/authMiddleware.js";
const router = express.Router();

router.post("/update-settings", protect(['agent']) ,updateAgencySettings);
router.get("/get-settings", protect(['agent']) ,getAgencySettings);

export default router;
