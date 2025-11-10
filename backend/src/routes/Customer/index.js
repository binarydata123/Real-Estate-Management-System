import express from "express";
import propertyRoutes from "./Property/index.js";
import profileRoutes from "./Profile/index.js"
const router = express.Router();
router.use("/properties", propertyRoutes);
router.use("/profile",profileRoutes)
export default router;
