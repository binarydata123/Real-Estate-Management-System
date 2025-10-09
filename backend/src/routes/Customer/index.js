import express from "express";
import propertyRoutes from "./Property/index.js";

const router = express.Router();
router.use("/properties", propertyRoutes);
export default router;
