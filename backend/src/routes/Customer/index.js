import express from "express";
import propertyRoutes from "./Property/index.js";
import profileRoutes from "./Profile/index.js";
import meetingRoutes from "./Meetings/index.js";
import settingRoutes from "./Settings/index.js";
import messagesRoutes from "./Messages/index.js";

const router = express.Router();

router.use("/properties", propertyRoutes);
router.use("/meetings", meetingRoutes);
router.use("/customer-settings", settingRoutes);
router.use("/messages", messagesRoutes);
router.use("/properties", propertyRoutes);
router.use("/profile", profileRoutes);

export default router;
