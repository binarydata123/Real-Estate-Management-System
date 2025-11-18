import { Customer } from "../../models/Agent/CustomerModel.js";
import { Meetings } from "../../models/Agent/MeetingModel.js";
import { Property } from "../../models/Agent/PropertyModel.js";
export const agencyDashboardData = async (req, res) => {
  try {
    const agencyId = req.user?.agencyId?._id;
    if (!agencyId) {
      return res.status(400).json({
        success: false,
        message: "Agency ID Not Found",
      });
    }

    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setUTCHours(23, 59, 59, 999);

    const [
      totalProperties,
      totalCustomers,
      totalMeetings,
      todayMeetings,
      topCustomers,
    ] = await Promise.all([
      Property.countDocuments({ agencyId }),
      Customer.countDocuments({ agencyId }),
      Meetings.countDocuments({ agencyId ,date:{ $gte:startOfDay} }),
      Meetings.find({
        agencyId,
        date: { $gte: startOfDay, $lte: endOfDay },
      }).limit(3).populate("customerId propertyId"),

      Customer.aggregate([
        { $sort: { maximumBudget: -1 } },
        { $limit: 3 },
      ]),

    ]);
const properties = await Property.find({ agencyId })
  .sort({ createdAt: -1 })
  .limit(2);
    const data = {
      totalProperties,
      totalCustomers,
      totalMeetings,
      todayMeetings,
      topCustomers,
      properties
    };

    return res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully.",
      data,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching dashboard data.",
    });
  }
};

