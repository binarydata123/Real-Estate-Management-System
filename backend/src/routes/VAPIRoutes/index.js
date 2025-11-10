import express from "express";
const router = express.Router();
import { protect } from "../../middleware/authMiddleware.js";
import { createCustomerRecord } from "../../controllers/AI/assistantController.js";

router.post("/save-lead", createCustomerRecord);

export default router;
