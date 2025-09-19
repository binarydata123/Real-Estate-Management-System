import express from "express";
import {
  shareProperty,
  getAllSharedProperties,
} from "../../../controllers/Agent/SharePropertyController.js";
const router = express.Router();

router.post("/postShareProperty", shareProperty);
router.get("/getAllSharedProperties", getAllSharedProperties);

export default router;
