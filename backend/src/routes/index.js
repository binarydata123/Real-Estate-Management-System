import agentRoutes from "./agentRoutes.js";
import propertyRoutes from "./propertyRoutes.js";
import userRoutes from "./userRoutes.js";
import authRoutes from "./authRoutes.js";
import customerRoutes from "./customerRoutes.js";
import express from "express";

const router = express.Router();

// routes
router.use("/auth", authRoutes);
router.use("/agents", agentRoutes);
router.use("/properties", propertyRoutes);
router.use("/users", userRoutes);
router.use("/customers", customerRoutes);

export default router;
