import express from "express";
import { getAgencySettings, updateAgencySettings } from "../../../controllers/Agent/SettingsController.js";
const router = express.Router();

router.post("/update-settings", updateAgencySettings);
router.get("/get-settings", getAgencySettings);

export default router;
