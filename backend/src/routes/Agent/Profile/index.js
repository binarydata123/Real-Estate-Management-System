import express from "express";
import { getAgentProfile, updateAgentProfile } from "../../../controllers/Agent/ProfileController.js";
import { protect } from "../../../middleware/authMiddleware.js";
const router=express.Router();


router.get("/",protect(["agent"]),getAgentProfile);
router.post("/update",protect(["agent"]),updateAgentProfile);

export default router;