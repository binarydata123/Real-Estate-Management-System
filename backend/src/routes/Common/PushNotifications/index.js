import express from "express";
import {
  createSubscription,
  sendNotification,
} from "../../../controllers/common/pushNotificationController.js";
const router = express.Router();

// CRUD
router.post("/subscribe-user", createSubscription);
router.post("/notification", sendNotification);

export default router;
