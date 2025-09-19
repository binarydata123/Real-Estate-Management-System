import express from "express";
import PushNotificationsRoute from "./PushNotifications/index.js";
import NotificationsRoute from "./Notifications/index.js";
const router = express.Router();

// routes
router.use("/push-notification", PushNotificationsRoute);
router.use("/notification", NotificationsRoute);

export default router;
