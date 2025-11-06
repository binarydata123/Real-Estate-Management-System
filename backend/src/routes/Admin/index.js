import express from "express";
import agencyRoutes from "./Agency/index.js";
import usersRoutes from "./Users/index.js";
import propertyRoutes from "./Property/index.js";
import customerRoutes from "./Customer/index.js";
import agentsRoutes from "./Agents/index.js";
import dashboardRoutes from "./Dashboard/index.js";
import profileRoutes from "./Profile/index.js";
import analyticsRoutes from "./Analytics/index.js";

const router = express.Router();

router.use("/agency", agencyRoutes);
router.use("/users", usersRoutes);
router.use("/properties", propertyRoutes);
router.use("/customers", customerRoutes);
router.use("/agents", agentsRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/profile", profileRoutes);
router.use("/analytics", analyticsRoutes);
export default router;
