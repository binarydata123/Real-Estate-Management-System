import { Notification } from "../../models/Common/NotificationModel.js";
// Create a new notification
export const createNotification = async (req, res) => {
  try {
    const { agencyId, message, type, link } = req.body;

    const notification = await Notification.create({
      userId: req.user._id,
      agencyId: agencyId || null,
      message,
      type: type || "welcome",
      link: link || "",
    });

    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, page = 1, limit = 10 } = req.query;

    const numericPage = Number(page) || 1;
    const numericLimit = Number(limit) || 10;
    const skip = (numericPage - 1) * numericLimit;


    const query = { userId };

    if (type) {
      if (type === "unread") {
        query.isRead = false;
      } else if (type !== "all") {
        // Only filter by type if NOT "all"
        query.type = type;
      }
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(numericLimit)
      .lean();

    const total = await Notification.countDocuments(query);

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        total,
        page: numericPage,
        limit: numericLimit,
        totalPages: Math.ceil(total / numericLimit),
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get unread notifications for a user
export const getUnreadNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications = await Notification.countDocuments({
      userId: userId,
      isRead: false,
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: notifications });
  } catch (error) {
    console.error("Error fetching unread notifications:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Mark a notification as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
    );

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

  return res.json({ success: true, data: notification });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findByIdAndDelete({ id, userId });

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

  return res.json({ success: true, message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
  return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Mark all notifications for a user as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await Notification.updateMany(
      { userId: userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} notification(s) marked as read`,
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
