import { User } from "../../models/Common/UserModel.js";
import { Agency } from "../../models/Agent/AgencyModel.js";
import { Customer } from "../../models/Agent/CustomerModel.js";
import { Property } from "../../models/Agent/PropertyModel.js";
import { Meetings } from "../../models/Agent/MeetingModel.js";
import { PropertyShare } from "../../models/Agent/PropertyShareModel.js";

export const getAnalyticsData = async (req, res) => {
  try {
    // --- Basic Counts ---
    const totalUsers = await User.countDocuments();
    const totalAgencies = await Agency.countDocuments();
    const totalCustomers = await Customer.countDocuments();
    const totalProperties = await Property.countDocuments();
    const totalMeetings = await Meetings.countDocuments();
    const totalSharedProperties = await PropertyShare.countDocuments();

    // --- Monthly User Signups (for line/bar chart) ---
    const monthlyUsers = await User.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    // --- Monthly Customer Signups (for line/bar chart) ---
    const monthlyCustomers = await Customer.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id": 1 } },
    ]);


    const activities = [];

    // ✅ 1. New property listings
    const recentProperties = await Property.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('owner', 'title');

    for (const p of recentProperties) {
      const agencyData = await Agency.findOne({ _id: p.agencyId }).populate('owner');
      if (agencyData && agencyData.owner) {
        activities.push({
          id: p._id,
          user: agencyData.owner.name || 'Unknown User',
          action: 'listed a new property',
          time: timeAgo(p.createdAt),
          icon: 'Home',
        });
      }
    }

    // ✅ 2. Closed deals
    const recentDeals = await Property.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('owner', 'name');

    for (const d of recentDeals) {
      const agencyData = await Agency.findOne({ _id: d.agencyId }).populate('owner');
      if (agencyData && agencyData.owner) {
        activities.push({
          id: d._id,
          user: agencyData.owner.name || 'Unknown Agent',
          action: 'closed a deal',
          time: timeAgo(d.createdAt),
          icon: 'DollarSign',
        });
      }
    }

    // ✅ 3. New users joined
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(3);

    recentUsers.forEach((u) => {
      activities.push({
        _id: u._id,
        user: u.name,
        action: 'joined the platform',
        time: timeAgo(u.createdAt),
        icon: 'UserPlus',
      });
    });

    // ✅ Sort all activities by most recent
    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const recentActivities = activities.slice(0, 5);

    // --- Top Agents (by number of properties listed) ---
    const topAgents = await Property.aggregate([
      { $group: { _id: "$owner", totalProperties: { $sum: 1 } } },
      { $sort: { totalProperties: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          id: "$user._id",
          name: "$user.name",
          deals: "$totalProperties",
          avatar: "$user.profilePictureUrl", // rename to match your frontend
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalAgencies,
          totalCustomers,
          totalProperties,
          totalMeetings,
          totalSharedProperties
        },
        monthlyUsers,
        monthlyCustomers,
        recentActivities,
        topAgents,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🕒 Utility to show “x time ago”
function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = [
    { label: 'y', seconds: 31536000 },
    { label: 'mo', seconds: 2592000 },
    { label: 'd', seconds: 86400 },
    { label: 'h', seconds: 3600 },
    { label: 'm', seconds: 60 },
  ];

  for (const i of intervals) {
    const count = Math.floor(seconds / i.seconds);
    if (count >= 1) {
      return `${count}${i.label} ago`;
    }
  }
  return 'just now';
}
