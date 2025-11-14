import express from "express";
import {
  getCustomerSettings,
  updateCustomerSettings,
} from "../../../controllers/Customer/SettingsController.js";
const router = express.Router();
import { protect } from "../../../middleware/authMiddleware.js";



router.post("/update-settings",protect(['customer']), updateCustomerSettings);
router.get("/get-settings",protect(['customer']), getCustomerSettings);

export default router;
