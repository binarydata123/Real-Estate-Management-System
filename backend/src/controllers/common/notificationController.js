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

// Get all notifications for a user
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, page = 1, limit = 10 } = req.query; // ✅ type filter + pagination

    const query = { userId };

    // ✅ if type is provided, filter by type
    if (type && type !== "unread" ) {
      query.type = type; // e.g. "unread", "meeting_scheduled", etc.
    }
    if (type == "unread") {
      query.read = false;
    }

    const skip = (Number(page) - 1) * Number(limit);

    // ✅ fetch notifications
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // ✅ count total for pagination
    const total = await Notification.countDocuments(query);

    res.json({
      success: true,
      data: notifications,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
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
      read: false,
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
      { read: true },
    );

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    res.json({ success: true, data: notification });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ success: false, message: "Server error" });
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

    res.json({ success: true, message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Mark all notifications for a user as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await Notification.updateMany(
      { userId: userId, read: false },
      { $set: { read: true } }
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
