import { Meetings } from "../../models/Agent/MeetingModel.js";
import { PropertyShare } from "../../models/Agent/PropertyShareModel.js";
import { Notification } from "../../models/Common/NotificationModel.js";
import { Property } from "../../models/Agent/PropertyModel.js"; // Add Property model import
import { Customer } from "../../models/Agent/CustomerModel.js";

export const customerDashboardData = async (req, res) => {
  try {
    const customerId = req.user.id;
   
    const showAllProperty = req.user.showAllProperty; // Get toggle state from user
    // console.log("showAllProperty:", showAllProperty);
  let agencyId = req.user.agencyId?._id || req.user.agencyId;// Get agency ID
  
    // console.log("Agency_ID id: ", agencyId)

    // Start of today (UTC)
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    // Prepare queries based on showAllProperty toggle
    let propertyCountQuery;
    let latestPropertiesQuery;

    if (showAllProperty === true) {
      // TOGGLE ON: Get all properties for the agency
      propertyCountQuery = Property.countDocuments({
        agencyId: agencyId,
        isDeleted: false, // Exclude deleted properties
      });

      latestPropertiesQuery = Property.find({
        agencyId: agencyId,
        isDeleted: false,
      })
        .sort({ createdAt: -1 })
        .limit(2)
        .select("title images price location")
        .lean();
    } else {
      // TOGGLE OFF: Get only shared properties
      propertyCountQuery = PropertyShare.countDocuments({
        sharedWithUserId: customerId,
      });

      latestPropertiesQuery = PropertyShare.find({
        sharedWithUserId: customerId,
      })
        .sort({ createdAt: -1 })
        .limit(2)
        .populate("propertyId", "title images price location");
    }

    // Run all queries in parallel
    const [
      totalMeeting,
      propertyCount,
      latestProperties,
      totalNotifications,
      recentActivity,
    ] = await Promise.all([
      // Today's meetings count
      Meetings.countDocuments({
        customerId,
        date: { $gte: startOfDay },
        status: { $ne: "cancelled" },
      }),
      // Property count (dynamic based on toggle)
      propertyCountQuery,
      // Latest properties (dynamic based on toggle)
      latestPropertiesQuery,
      // Unread notifications count
      Notification.countDocuments({
        userId: customerId,
        isRead: false,
      }),
      // Recent activity
      Notification.find({
        userId: customerId,
        type: { $ne: "welcome" },
      })
        .sort({ createdAt: -1 })
        .limit(4),
    ]);

    // Format the response data
    let formattedLatestProperties;

    if (showAllProperty === true) {
      // When toggle is ON, properties come directly from Property model
      formattedLatestProperties = latestProperties.map((property) => ({
        propertyId: property,
      }));
    } else {
      // When toggle is OFF, properties come from PropertyShare model
      formattedLatestProperties = latestProperties;
    }

    const data = {
      totalMeeting,
      totalSharedProperties: showAllProperty ? null : propertyCount, // Legacy field
      totalAllProperties: showAllProperty ? propertyCount : null, // New field for all properties
      totalProperties: propertyCount, // General field that works for both cases
      latestSharedProperties: formattedLatestProperties,
      totalNotifications,
      recentActivity,
      showAllProperty, // Include toggle state in response
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




// export const customerDashboardData = async (req, res) => {
//   try {
//     const customerId = req.user.id;

//     let agencyId = req.user.agencyId?._id || req.user.agencyId;
//     let showAllProperty = req.user.showAllProperty;

//     // Method 2: If not found, fetch from database with populated agency
//     if (!agencyId || showAllProperty === undefined) {
//       console.log("⚠️ Agency not in req.user, fetching from database...");

//       const customer = await Customer.findById(customerId)
//         .select("showAllProperty agencyId")
//         .lean();

//       if (!customer) {
//         return res.status(404).json({
//           success: false,
//           message: "Customer not found",
//         });
//       }

//       showAllProperty = customer.showAllProperty;
//       agencyId = customer.agencyId;
//     }

//     console.log("👤 Customer ID:", customerId);
//     console.log("🏢 Agency ID:", agencyId);
//     console.log("🔄 Show All Property:", showAllProperty);

//     // If no agency, return empty dashboard
//     if (!agencyId) {
//       console.log("⚠️ No agency linked to this customer");

//       // Still fetch meetings and notifications
//       const [totalMeeting, totalNotifications, recentActivity] =
//         await Promise.all([
//           Meetings.countDocuments({
//             customerId,
//             status: { $ne: "cancelled" },
//           }),
//           Notification.countDocuments({
//             userId: customerId,
//             isRead: false,
//           }),
//           Notification.find({
//             userId: customerId,
//             type: { $ne: "welcome" },
//           })
//             .sort({ createdAt: -1 })
//             .limit(4)
//             .lean(),
//         ]);

//       return res.status(200).json({
//         success: true,
//         message: "Customer dashboard data fetched successfully",
//         data: {
//           totalMeeting,
//           totalProperties: 0,
//           totalSharedProperties: 0,
//           totalAllProperties: 0,
//           latestSharedProperties: [],
//           totalNotifications,
//           recentActivity,
//           showAllProperty: false,
//         },
//       });
//     }

//     // Start of today (UTC)
//     const startOfDay = new Date();
//     startOfDay.setUTCHours(0, 0, 0, 0);

//     let propertyCountQuery;
//     let latestPropertiesQuery;

//     if (showAllProperty === true) {
//       // TOGGLE ON: Customer can see ALL agency properties
//       console.log("✅ Fetching ALL properties for agency:", agencyId);
//       console.log("🔍 Agency ID type:", typeof agencyId, agencyId);

//       // Convert to string for MongoDB query
//       const agencyIdString = agencyId.toString();
//       console.log("🔍 Agency ID as string:", agencyIdString);

//       // First, let's check if ANY properties exist for this agency
//       const sampleProperty = await Property.findOne({
//         agencyId: agencyIdString,
//       }).lean();
//       console.log("🔍 Sample property found:", sampleProperty ? "YES" : "NO");
//       if (sampleProperty) {
//         console.log("🔍 Sample property agencyId:", sampleProperty.agencyId);
//       }

//       // Check total properties without isDeleted filter
//       const totalWithoutFilter = await Property.countDocuments({
//         agencyId: agencyIdString,
//       });
//       console.log(
//         "🔍 Total properties (without isDeleted filter):",
//         totalWithoutFilter
//       );

//       propertyCountQuery = Property.countDocuments({
//         agencyId: agencyIdString,
//         isDeleted: false,
//       });

//       latestPropertiesQuery = Property.find({
//         agencyId: agencyIdString,
//         isDeleted: false,
//       })
//         .sort({ createdAt: -1 })
//         .limit(2)
//         .select("_id title images price location agencyId isDeleted")
//         .lean();
//     } else {
//       // TOGGLE OFF: Customer can see only SHARED properties
//       console.log("✅ Fetching SHARED properties for customer:", customerId);

//       propertyCountQuery = PropertyShare.countDocuments({
//         sharedWithUserId: customerId,
//       });

//       latestPropertiesQuery = PropertyShare.find({
//         sharedWithUserId: customerId,
//       })
//         .sort({ createdAt: -1 })
//         .limit(2)
//         .populate("propertyId", "_id title images price location")
//         .lean();
//     }

//     // Run all queries in parallel
//     const [
//       totalMeeting,
//       propertyCount,
//       latestProperties,
//       totalNotifications,
//       recentActivity,
//     ] = await Promise.all([
//       Meetings.countDocuments({
//         customerId,
//         date: { $gte: startOfDay },
//         status: { $ne: "cancelled" },
//       }),
//       propertyCountQuery,
//       latestPropertiesQuery,
//       Notification.countDocuments({
//         userId: customerId,
//         isRead: false,
//       }),
//       Notification.find({
//         userId: customerId,
//         type: { $ne: "welcome" },
//       })
//         .sort({ createdAt: -1 })
//         .limit(4)
//         .lean(),
//     ]);

//     console.log("📊 Property Count:", propertyCount);
//     console.log("📋 Latest Properties Found:", latestProperties.length);

//     // Format properties to have consistent structure
//     let formattedLatestProperties;

//     if (showAllProperty === true) {
//       // Properties come directly from Property model
//       // Wrap them in propertyId structure for frontend consistency
//       formattedLatestProperties = latestProperties.map((property) => ({
//         propertyId: {
//           _id: property._id,
//           title: property.title,
//           images: property.images || [],
//           price: property.price,
//           location: property.location,
//         },
//       }));

//       console.log(
//         "✅ Formatted ALL properties:",
//         formattedLatestProperties.length
//       );
//     } else {
//       // Properties come from PropertyShare with populated propertyId
//       formattedLatestProperties = latestProperties;
//       console.log(
//         "✅ Using SHARED properties:",
//         formattedLatestProperties.length
//       );
//     }

//     const data = {
//       totalMeeting,
//       totalProperties: propertyCount, // Unified field - works for both toggle states
//       totalSharedProperties: showAllProperty ? null : propertyCount, // Legacy support
//       totalAllProperties: showAllProperty ? propertyCount : 0, // Legacy support
//       latestSharedProperties: formattedLatestProperties,
//       totalNotifications,
//       recentActivity,
//       showAllProperty,
//     };

//     console.log("✅ Final Response:", {
//       totalProperties: data.totalProperties,
//       totalAllProperties: data.totalAllProperties,
//       totalSharedProperties: data.totalSharedProperties,
//       showAllProperty: data.showAllProperty,
//       latestPropertiesCount: data.latestSharedProperties.length,
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Customer dashboard data fetched successfully",
//       data,
//     });
//   } catch (error) {
//     console.error("❌ Error in customerDashboardData:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch dashboard data",
//       error: error.message,
//     });
//   }
// };