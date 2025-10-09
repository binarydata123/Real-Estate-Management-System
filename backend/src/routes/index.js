import agentRoutes from "./Agent/index.js";
import propertyRoutes from "./Agent/Property/index.js";
import userRoutes from "./Common/User/index.js";
import authRoutes from "./Authentication/index.js";
import commonRoutes from "./Common/index.js";
import assistantRoutes from "./AIAssistant/index.js";
import express from "express";
import adminRoutes from "./Admin/index.js";
import customerRoutes from "./Customer/index.js";

const router = express.Router();

// routes
router.use("/auth", authRoutes);
router.use("/agent", agentRoutes);
router.use("/properties", propertyRoutes);
router.use("/users", userRoutes);
router.use("/common", commonRoutes);
router.use('/assistant', assistantRoutes);
router.use("/admin", adminRoutes);
router.use("/customer", customerRoutes);

export default router;
