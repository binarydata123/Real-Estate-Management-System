import express from "express";
import { protect } from "../../../middleware/authMiddleware.js";
import { customerDashboardData } from "../../../controllers/Customer/DashboardController.js";
const router = express.Router();


router.get("/dashborad-data",protect(["customer"]),customerDashboardData);


export default router;