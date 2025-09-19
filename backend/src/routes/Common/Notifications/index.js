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
import { protect } from "../../../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Create a new notification
router.post(
  "/create",
  protect(["admin", "agency", "agent", "customer", "AgencyAdmin"]),
  createNotification
);

// ✅ Get all notifications for a user
router.get(
  "/get-by-user",
  protect(["admin", "agency", "agent", "customer", "AgencyAdmin"]),
  getUserNotifications
);

router.get(
  "/get-unread-notifications",
  protect(["admin", "agency", "agent", "customer", "AgencyAdmin"]),
  getUnreadNotifications
);

// ✅ Mark a single notification as read
router.patch(
  "/mark-as-read/:id",
  protect(["admin", "agency", "agent", "customer", "AgencyAdmin"]),
  markAsRead
);

// ✅ Mark all notifications as read for a user
router.patch(
  "/mark-all-read",
  protect(["admin", "agency", "agent", "customer", "AgencyAdmin"]),
  markAllAsRead
);

// ✅ Delete a notification
router.delete(
  "/delete/:id",
  protect(["admin", "agency", "agent", "customer", "AgencyAdmin"]),
  deleteNotification
);
``;
export default router;
