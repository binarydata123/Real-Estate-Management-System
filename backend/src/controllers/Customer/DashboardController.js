import { Meetings } from "../../models/Agent/MeetingModel.js";
import { PropertyShare } from "../../models/Agent/PropertyShareModel.js";
import { Notification } from "../../models/Common/NotificationModel.js";
import { Property } from "../../models/Agent/PropertyModel.js"; // Add Property model import
// import { Customer } from "../../models/Agent/CustomerModel.js";
import mongoose from "mongoose";

export const customerDashboardData = async (req, res) => {
  try {
    const customerId = req.user.id;
    const showAllProperty = req.user.showAllProperty;

    let agencyId = req.user.agencyId;

    // Handle different formats of agencyId
    if (agencyId && typeof agencyId === "object") {
    
      if (agencyId._id) {
        agencyId = agencyId._id.toString();
      }
      // If it's an object with id property, extract the id
      else if (agencyId.id) {
        agencyId = agencyId.id.toString();
      }
      // If it's a plain ObjectId, convert to string
      else {
        agencyId = agencyId.toString();
      }
    }
    if (!agencyId) {
      return res.status(400).json({
        success: false,
        message: "Agency ID not found for this customer",
      });
    }

    // Start of today (UTC)
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);


    let propertyCountQuery;
    let latestPropertiesQuery;

    if (showAllProperty === true) {
      // TOGGLE ON: Get all properties for the agency
      propertyCountQuery = Property.countDocuments({
        agencyId: agencyId,
        
      });

      latestPropertiesQuery = Property.find({
        agencyId: agencyId,
       
      })
        .sort({ createdAt: -1 })
        .limit(2)
        .select("title images price location")
        .lean();

      // Check if properties exist
      // const debugCount = await Property.countDocuments({
      //   agencyId: agencyId,
      // });

      // const activeCount = await Property.countDocuments({
      //   agencyId: agencyId,
      //   isDeleted: false,
      // });
      // console.log("Agency properties count (active only):", activeCount);
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
      
      Meetings.countDocuments({
        agencyId,
        isDeleted: false,
        status: { $nin: ["cancelled", "past"] }, // Use $nin for multiple values
       
      }),
      propertyCountQuery,
      latestPropertiesQuery,
      Notification.countDocuments({
        userId: new mongoose.Types.ObjectId(customerId),
        isRead: false,
      }),
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
      totalSharedProperties: showAllProperty ? null : propertyCount,
      totalAllProperties: showAllProperty ? propertyCount : null,
      totalProperties: propertyCount,
      latestSharedProperties: formattedLatestProperties,
      totalNotifications,
      recentActivity,
      showAllProperty,
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

