import { User } from "../../models/Common/UserModel.js";
import { Agency } from "../../models/Agent/AgencyModel.js";
import { Customer } from "../../models/Agent/CustomerModel.js";
import { Property } from "../../models/Agent/PropertyModel.js";

export const getDashboardData = async (req, res) => {
  try {
    // 1️⃣ Stats
    const totalUsers = await User.countDocuments();
    const totalAgencies = await Agency.countDocuments();
    const totalProperties = await Property.countDocuments();
    const pendingApprovals = await User.countDocuments({ status: "pending" });

    const stats = [
      { name: "Total Users", stat: totalUsers },
      { name: "Total Agencies", stat: totalAgencies },
      { name: "Total Properties", stat: totalProperties },
      { name: "Pending Approvals", stat: pendingApprovals },
    ];

    // 2️⃣ User growth (last 6 months)
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const currentYear = new Date().getFullYear();
    const userGrowthData = await Promise.all(
      months.map(async (month, index) => {
        const usersInMonth = await User.countDocuments({
          createdAt: {
            $gte: new Date(currentYear, index, 1), // Replace 2025 with dynamic year if needed
            $lte: new Date(currentYear, index + 1, 0),
          },
        });
        return { name: month, users: usersInMonth };
      })
    );

    // Properties per month
    const propertyGrowthData = await Promise.all(
      months.map(async (month, index) => {
        const propertiesInMonth = await Property.countDocuments({
          createdAt: {
            $gte: new Date(currentYear, index, 1),
            $lte: new Date(currentYear, index + 1, 0),
          },
        });
        return { name: month, properties: propertiesInMonth };
      })
    );

    // 3️⃣ Recent Users (last 5)
    const recentUsers = await User.find({ role: { $in: ["agent", "customer"] } })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("_id name email role createdAt");

    // 4️⃣ Recent Agencies (last 5)
    const recentAgencies = await Agency.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("_id name email phone");

    res.json({
      success: true,
      data: {
        stats,
        userGrowthData,
        propertyGrowthData,
        recentUsers,
        recentAgencies,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
