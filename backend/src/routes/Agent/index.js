import express from "express";
import customerRoutes from "../Agent/Customer/index.js";

const router = express.Router();

router.use("/customers", customerRoutes);

export default router;
