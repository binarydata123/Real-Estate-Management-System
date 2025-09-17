
import express from "express";
import PushNotificationsRoute from "./PushNotifications/index.js"
const router = express.Router();

// routes
router.use("/push-notification", PushNotificationsRoute);

export default router;
