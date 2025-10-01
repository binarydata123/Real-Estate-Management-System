import express from "express";
import agencyRoutes from "./Agency/index.js";
import usersRoutes from "./Users/index.js";
import propertyRoutes from "./Property/index.js";

const router = express.Router();

router.use("/agency", agencyRoutes);
router.use("/users", usersRoutes);
router.use("/properties", propertyRoutes);

export default router;
