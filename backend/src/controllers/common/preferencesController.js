import { Preference } from "../../models/Common/PreferenceModel.js";
import { Customer } from "../../models/Agent/CustomerModel.js";
import { PreferenceRequest } from "../../models/Agent/PreferenceRequestModel.js";
import { createNotification } from "../../utils/apiFunctions/Notifications/index.js";
import { sendPushNotification } from "../../utils/pushService.js";
import AgencySettings from "../../models/Agent/settingsModel.js";
import CustomerSettings from "../../models/Customer/SettingsModel.js";

export const createPreference = async (req, res) => {
  try {
    const userId = req.body.customerId;
    if(!userId){
      return res.status(400).json({
        success:false,
        message:"userId is required",

      })
    }
    
    const preferenceData = req.body;

    // Use findOneAndUpdate with upsert to create a new preference if one doesn't exist,
    // or update the existing one. This is ideal for managing user preferences.
    const savedPreference = await Preference.findOneAndUpdate(
      { userId: userId }, // find a document with this filter
      { ...preferenceData, userId: userId }, // document to insert when nothing is found
      {
        new: true, 
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      } // options
    );
    if(!savedPreference){
      return res.status(400).json({
        success:"false",
        message:"Failed to saved preference"
      })
    }

    res.status(200).json({
      success: true,
      message: "Preferences saved successfully.",
      data: savedPreference,
    });
  } catch (error) {
    console.error("Error saving preference:", error);
    res.status(500).json({
      success: false,
      message: "Server error while saving preferences.",
    });
  }
};

export const getPreferenceDetail = async (req, res) => {
  try {
    const userId = req.params.userId;

    const preference = await Preference.findOne({ userId: userId });

    const request = await PreferenceRequest.findOne({
      sentToUserId: userId,
      sentByUserId: req.user._id,
    });


    res.status(200).json({
      success: true,
      data: preference,
      requestSent: request ? true : false,
    });
  } catch (error) {
    console.error("Error getting preference detail:", error);
    res.status(500).json({
      success: false,
      message: "Server error while getting preference detail.",
    });
  }
};

export const sendRequestToCustomer = async (req, res) => {
  try {
    const customerId = req.params.id;
    const agent = req.user;

    if (!customerId) {
      return res
        .status(400)
        .json({ success: false, message: "Customer ID is required." });
    }

    const customer = await Customer.findById(customerId).populate("agencyId");
    let agencyData;
    if (agent.agencyId) {
      agencyData = agent.agencyId;
    } else {
      agencyData = customer.agencyId;
    }
    // Create a record of the request being sent
    await PreferenceRequest.create({
      agencyId: agencyData._id,
      sentByUserId: agent._id,
      sentToUserId: customerId,
    });

    // Create an in-app notification for the customer
    await createNotification({
      userId: customerId,
      message: `${agencyData.name} has requested you to fill out your property preferences.`,
      type: "preference_request",
      link: "/preferences", // A link to the preferences page on the frontend
    });

    // create notification to agency
    await createNotification({
      userId: agent._id,
      message: `A new preference request has been sent to your customer ${customer.fullName}.`,
      type: "preference_request",
      link: "/preferences",
    });

    // Send a push notification to the customer
    const customerSettings = await CustomerSettings.findOne({
      userId: customerId,
    });
    let result = { success: false, sent: 0 };
    if (customerSettings?.notifications?.pushNotifications) {
      result = await sendPushNotification({
        userId: customerId,
        title: "Update Your Preferences",
        message: `${agencyData.name} has requested you to fill out your property preferences to find the best matches for you.`,
        urlPath: "/preferences",
      });
    }

    // push notification to agency
    const agencySettings = await AgencySettings.findOne({
      userId: req.user._id,
    });
    if (agencySettings?.notifications?.pushNotifications)
      await sendPushNotification({
        userId: req.user._id,
        title: "New Preference Request",
        message: `A new preference request has been sent to your customer ${customer.fullName}.`,
        urlPath: "/preferences",
      });

    let customerPushNotificationResult;
    if (result && result.success === false && result.sent === 0) {
      customerPushNotificationResult =
        "Notification could not be sent — customer is not subscribed to push notifications.";
    }

    return res.status(200).json({
      success: true,
      message: "Request sent to customer successfully.",
      customerPushNotificationResult,
    });
  } catch (err) {
    console.error("Error sending request to customer:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while sending request to customer.",
    });
  }
};
