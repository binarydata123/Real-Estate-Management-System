import express from "express";
import {
    getProperties,
    getAllSharedProperties,
} from "../../../controllers/Customer/PropertyController.js";
const router = express.Router();
import { protect } from "../../../middleware/authMiddleware.js";

router.get('/', protect(["admin", "agent", "customer"]), getProperties);
router.get("/getAllSharedProperties", getAllSharedProperties);

export default router;