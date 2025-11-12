import { PropertyShare } from "../../models/Agent/PropertyShareModel.js";
import mongoose from "mongoose";
import { createNotification } from "../../utils/apiFunctions/Notifications/index.js";
import { sendPushNotification } from "../../utils/pushService.js";

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

    await createNotification({
      agencyId,
      userId: agencyId,
      message: `Property has been shared successfully.`,
      type: "property_share",
    });

    await createNotification({
      userId: sharedWithUserId,
      message: `A property has been shared with you.`,
      type: "property_share",
    });

    await sendPushNotification({
      userId: sharedWithUserId,
      title: "New Property Shared",
      message: "A property has been shared with you. Check it out!",
      urlPath: "/agent/shares",
    });

    await sendPushNotification({
      userId: agencyId,
      title: "Property Shared Successfully",
      message: "You have shared a property successfully.",
      urlPath: "/agent/shares",
    });
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
    const { agencyId } = req.query;

    if (!agencyId) {
      return res.status(400).json({ error: "Agency ID is required" });
    }

    const shares = await PropertyShare.find({ agencyId })
      .sort({ _id: -1 })
      .populate("sharedWithUserId", "fullName email phone")
      .populate("sharedByUserId", "name email phone createdAt")
      .populate("propertyId", "title images price");

   return res.status(200).json({
      success: true,
      data: shares,
      message: "Shared properties fetched successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};
