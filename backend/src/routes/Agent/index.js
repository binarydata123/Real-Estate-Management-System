import express from "express";
import customerRoutes from "./Customer/index.js";
import meetingRoutes from "./Meetings/index.js";
import propertyRoutes from "./Property/index.js";
import sharePropertyRoutes from "./ShareProperty/index.js";

const router = express.Router();

router.use("/customers", customerRoutes);

router.use("/meetings", meetingRoutes);
router.use("/properties", propertyRoutes);
router.use("/shareProperties", sharePropertyRoutes);

export default router;
