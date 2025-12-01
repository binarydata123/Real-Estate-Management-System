import express from "express";
import { getAdminSettings } from "../../../controllers/Admin/AdminSettingsController.js";

const router = express.Router();

router.get("/", getAdminSettings);

export default router;
