import express from "express";

import customerRoutes from "./Customer/index.js";
import meetingRoutes from "./Meetings/index.js";

const router = express.Router();

router.use("/customers", customerRoutes);
router.use("/meetings", meetingRoutes);
export default router;
