import express from "express";
import agencyRoutes from "./Agency/index.js";
import usersRoutes from "./Users/index.js";
import propertyRoutes from "./Property/index.js";
import customerRoutes from "./Customer/index.js";
import agentsRoutes from "./Agents/index.js";
import dashboardRoutes from "./Dashboard/index.js";
import profileRoutes from "./Profile/index.js";
import analyticsRoutes from "./Analytics/index.js";
import adminSettingsRoutes from "./AdminSettings/index.js";
import teamMembersRoutes from "./TeamMembers/index.js";
import meetingsRoutes from "./Meetings/index.js";
import sharedPropertiesRoutes from "./SharedProperties/index.js";

const router = express.Router();

router.use("/agency", agencyRoutes);
router.use("/users", usersRoutes);
router.use("/properties", propertyRoutes);
router.use("/customers", customerRoutes);
router.use("/agents", agentsRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/profile", profileRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/admin-settings", adminSettingsRoutes);
router.use("/team-members", teamMembersRoutes);
router.use("/meetings", meetingsRoutes);
router.use("/shared-properties", sharedPropertiesRoutes);
export default router;
