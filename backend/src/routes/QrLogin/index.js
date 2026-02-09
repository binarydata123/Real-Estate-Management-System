import express from "express";
import {
  approveQr,
  checkQrStatus,
  createQr,
} from "../../controllers/QrLogin/qrLogin.controller.js";
import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", createQr);
router.post("/approve",protect(["admin", "agent","customer"]), approveQr);
router.get("/check-status/:token", checkQrStatus);

export default router;
