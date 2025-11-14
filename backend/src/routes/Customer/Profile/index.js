import express from "express";
import { getProfile, updateProfile } from "../../../controllers/Customer/ProfileController.js";
import { protect } from "../../../middleware/authMiddleware.js";
const router=express.Router();

router.get("/get-profile",protect(["customer"]),getProfile);
router.post("/update",protect(["customer"]),updateProfile);
export default router;