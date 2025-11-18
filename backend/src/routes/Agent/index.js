import express from "express";
import customerRoutes from "./Customer/index.js";
import meetingRoutes from "./Meetings/index.js";
import propertyRoutes from "./Property/index.js";
import sharePropertyRoutes from "./ShareProperty/index.js";
import inviteAgentRoutes from "./InviteAgent/index.js";
import agencySettings from "./Settings/index.js";
import messagesRoutes from "./Messages/index.js";
import profileRoutes from "./Profile/index.js";
import dashboardRoutes from "./Dashboard/index.js";
const router = express.Router();

router.use("/customers", customerRoutes);
router.use("/meetings", meetingRoutes);
router.use("/properties", propertyRoutes);
router.use("/shareProperties", sharePropertyRoutes);
router.use("/inviteAgent", inviteAgentRoutes);
router.use("/agency-settings", agencySettings);
router.use("/messages", messagesRoutes);
router.use("/profile", profileRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
