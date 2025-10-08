import express from "express";
import {
  getDashboardData
} from "../../../controllers/Admin/DashboardController.js";
import { protect } from "../../../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/get-all-dashboard-data",
  protect(["admin", "agent", "customer"]),
  getDashboardData
);

export default router;