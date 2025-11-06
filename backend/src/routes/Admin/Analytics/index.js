import express from "express";
import {
  getAnalyticsData
} from "../../../controllers/Admin/AnalyticsController.js";
import { protect } from "../../../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/get-all-analytics-data",
  protect(["admin", "agent", "customer"]),
  getAnalyticsData
);

export default router;