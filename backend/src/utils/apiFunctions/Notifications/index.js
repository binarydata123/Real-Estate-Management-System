import { Notification } from "../../../models/Common/NotificationModel.js";

// Create a notification
export const createNotification = async ({
  userId,
  agencyId,
  message,
  type,
  link,
  meta,
}) => {
  try {
    return await Notification.create({
      userId,
      agencyId: agencyId || null,
      message,
      type: type || "welcome",
      link: link || "",
      meta: meta || {},
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

// Get all notifications for a user
export const getNotifications = async (userId) => {
  try {
    return await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

// Get unread notifications for a user
export const getUnread = async (userId) => {
  try {
    return await Notification.find({ user: userId, read: false })
      .sort({ createdAt: -1 })
      .lean();
  } catch (error) {
    console.error("Error fetching unread notifications:", error);
    throw error;
  }
};

// Mark a notification as read
export const markRead = async (id) => {
  try {
    return await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

// Mark all notifications for a user as read
export const markAllRead = async (userId) => {
  try {
    const result = await Notification.updateMany(
      { user: userId, read: false },
      { $set: { read: true } }
    );
    return result.modifiedCount;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

// Delete a notification
export const deleteNotification = async (id) => {
  try {
    return await Notification.findByIdAndDelete(id);
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};
