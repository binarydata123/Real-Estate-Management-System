// routes/notificationRoutes.js
import express from "express";
import {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadNotifications,
} from "../../../controllers/common/notificationController.js";

const router = express.Router();

// ✅ Create a new notification
router.post("/create", createNotification);

// ✅ Get all notifications for a user
router.get("/get-by-user/:userId", getUserNotifications);

router.get("/get-unread-notifications/:userId", getUnreadNotifications);

// ✅ Mark a single notification as read
router.patch("/mark-as-read/:id", markAsRead);

// ✅ Mark all notifications as read for a user
router.patch("/mark-all-read/:userId", markAllAsRead);

// ✅ Delete a notification
router.delete("/delete/:id", deleteNotification);
``;
export default router;
