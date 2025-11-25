import { PropertyShare } from "../../models/Agent/PropertyShareModel.js";
import mongoose from "mongoose";
import { createNotification } from "../../utils/apiFunctions/Notifications/index.js";
import { sendPushNotification } from "../../utils/pushService.js";
import AgencySettings from "../../models/Agent/settingsModel.js";
import CustomerSettings from "../../models/Customer/SettingsModel.js";

export const shareProperty = async (req, res) => {
  try {
    const { agencyId, propertyId, sharedWithUserId, sharedByUserId, message } =
      req.body;

    if (!agencyId || !propertyId || !sharedWithUserId || !sharedByUserId) {
      return res
        .status(400)
        .json({ error: "All required fields must be provided" });
    }

    const newShare = new PropertyShare({
      agencyId: new mongoose.Types.ObjectId(agencyId),
      propertyId: new mongoose.Types.ObjectId(propertyId),
      sharedWithUserId: new mongoose.Types.ObjectId(sharedWithUserId),
      sharedByUserId: new mongoose.Types.ObjectId(sharedByUserId),
      message,
    });

    const savedShare = await newShare.save();

    const agencySettings = await AgencySettings.findOne({
      userId: req.user._id,
    });
    const customerSettings = await CustomerSettings.findOne({
      userId: sharedWithUserId,
    });

    if (agencySettings?.notifications?.pushNotifications)
 await sendPushNotification({
        userId: agencyId,
        title: "Property Shared Successfully",
        message: "You have shared a property successfully.",
        urlPath: "/agent/shares",
      });
      if (agencySettings?.notifications?.propertyUpdates) {
        await createNotification({
      agencyId,
      userId: agencyId,
      message: `Property has been shared successfully.`,
      type: "property_share",
    });

    }
    if (customerSettings?.notifications?.pushNotifications)
await sendPushNotification({
        userId: sharedWithUserId,
        title: "New Property Shared",
        message: "A property has been shared with you. Check it out!",
        urlPath: "/agent/shares",
      });
    if (customerSettings?.notifications?.propertyUpdates) {
      await createNotification({
      userId: sharedWithUserId,
      message: `A property has been shared with you.`,
      type: "property_share",
    });

    }
    return res.status(201).json({
      share: savedShare,
      message: "Share property successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const getAllSharedProperties = async (req, res) => {
  try {
    const { agencyId, page = 1, limit = 10 } = req.query;

    if (!agencyId) {
      return res.status(400).json({ error: "Agency ID is required" });
    }

    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    // 🔥 Count total documents
    const total = await PropertyShare.countDocuments({ agencyId });

    const shares = await PropertyShare.find({ agencyId })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limitNumber)
      .populate("sharedWithUserId", "fullName email phone")
      .populate("sharedByUserId", "name email phone createdAt")
      .populate("propertyId", "title images price");

    return res.status(200).json({
      success: true,
      data: shares,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
      message: "Shared properties fetched successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};
