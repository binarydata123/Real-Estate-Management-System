import { Meetings } from "../../models/Agent/MeetingModel.js";
import { PropertyShare } from "../../models/Agent/PropertyShareModel.js";
import { Notification } from "../../models/Common/NotificationModel.js";

export const customerDashboardData = async (req, res) => {
  try {
    const customerId = req.user.id;

    // Start of today (UTC)
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    // Run all queries in parallel
    const [
      totalMeeting,
      totalSharedProperties,
      latestSharedProperties,
      totalNotifications,
      recentActivity,
    ] = await Promise.all([
      // Today's meetings count
      Meetings.countDocuments({
        customerId,
        date: { $gte: startOfDay },
      }),
      // Get total count of shared properties
      PropertyShare.countDocuments({ sharedWithUserId: customerId }),
      // Get 2 latest shared properties
      PropertyShare.find({ sharedWithUserId: customerId })
        .sort({ createdAt: -1 })
        .limit(2)
        .populate("propertyId", "title images price location"),
      Notification.countDocuments({
        userId: customerId,
        isRead: false,
      }),
      Notification.find({
        userId: customerId,
        type: { $ne: "welcome" },
      })
        .sort({ createdAt: -1 })
        .limit(4),
    ]);

    const data = {
      totalMeeting,
      totalSharedProperties,
      latestSharedProperties,
      totalNotifications,
      recentActivity,
    };

    return res.status(200).json({
      success: true,
      message: "Customer dashboard data fetched successfully",
      data,
    });
  } catch (error) {
    console.error("Error in customerDashboardData:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
      error: error.message,
    });
  }
};
