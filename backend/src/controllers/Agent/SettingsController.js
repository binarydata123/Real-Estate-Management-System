import AgencySettings from "../../models/Agent/settingsModel.js";
import { sendPushNotification } from "../../utils/pushService.js";
export const getAgencySettings = async (req, res) => {
  try {
    const userId = req.user._id; // Use user ID instead of agencyId

    const agency = await AgencySettings.findOne({ userId });

    if (!agency) {
      return res.status(404).json({ message: "Agency settings not found" });
    }

    return res.status(200).json({
      success: true,
      data: agency,
    });
  } catch (error) {
    console.error("Error fetching agency settings:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const updateAgencySettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const updateData = req.body || {};

    // Remove any invalid fields that might cause validation errors
    const sanitizedUpdateData = { ...updateData };
    delete sanitizedUpdateData._id;
    delete sanitizedUpdateData.__v;
    delete sanitizedUpdateData.createdAt;
    delete sanitizedUpdateData.updatedAt;
console.log(sanitizedUpdateData);
    // Use findOneAndUpdate with upsert for atomic operation
    const agency = await AgencySettings.findOneAndUpdate(
      { userId },
      { $set: sanitizedUpdateData },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    const status =
      agency.createdAt.getTime() === agency.updatedAt.getTime() ? 201 : 200;

    const userSettings = await AgencySettings.findOne({ userId: req.user._id });

    if (userSettings.notifications.pushNotifications)
      await sendPushNotification({
        userId: req.user._id,
        title: "Agency settings updated successfully",
        message: `Hi ${req.user.name}, your settings has been updated successfully!`,
        urlPath: "/agent/settings",
      });
    return res.status(status).json({
      success: true,
      message:
        status === 201
          ? "Agency settings created successfully"
          : "Agency settings updated successfully",
      data: agency,
    });
  } catch (error) {
    console.error("Error updating agency settings:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
