import express from "express";
import { protect } from "../../../middleware/authMiddleware.js";
import { agencyDashboardData } from "../../../controllers/Agent/agencyDashboardController.js";
const router=express.Router();

router.get("/data",protect(["agent"]),agencyDashboardData);


export default router;