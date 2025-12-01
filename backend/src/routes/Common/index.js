import express from "express";
import PushNotificationsRoute from "./PushNotifications/index.js";
import NotificationsRoute from "./Notifications/index.js";
import PreferencesRoute from "./Preference/index.js";
import SettingsRoute from "./Settings/index.js";
const router = express.Router();

// routes
router.use("/push-notification", PushNotificationsRoute);
router.use("/notification", NotificationsRoute);
router.use('/preferences', PreferencesRoute);
router.use('/settings', SettingsRoute);

export default router;
