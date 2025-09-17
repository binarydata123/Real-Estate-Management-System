import agentRoutes from "./Agent/index.js";
import propertyRoutes from "./Agent/Property/index.js";
import userRoutes from "./Common/User/index.js";
import authRoutes from "./Authentication/index.js";
import express from "express";

const router = express.Router();

// routes
router.use("/auth", authRoutes);
router.use("/agent", agentRoutes);
router.use("/properties", propertyRoutes);
router.use("/users", userRoutes);

export default router;
