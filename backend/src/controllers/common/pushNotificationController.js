import PushNotificationSubscription from "../../models/Common/PushNotificationSubscription.js";
import webpush from "web-push";

// CREATE subscription
export const createSubscription = async (req, res) => {
  try {
    const { userId, role, subscription, device } = req.body;

    if (!userId || !subscription || !device?.id) {
      return res
        .status(400)
        .json({ error: "Missing userId, subscription, or device.id" });
    }

    const doc = {
      userId,
      role,
      subscription,
      device,
      updatedAt: new Date(),
    };

    // ✅ Upsert based on userId + device.id
    const subscriptionDoc = await PushNotificationSubscription.findOneAndUpdate(
      { userId, "subscription.keys.p256dh": subscription.keys.p256dh },
      { $set: doc, $setOnInsert: { createdAt: new Date() } },
      { new: true, upsert: true }
    );

  return res.status(200).json({ success: true, data: subscriptionDoc });
  } catch (err) {
    console.error("Error saving subscription:", err);
    return res.status(500).json({ error: "Failed to save subscription" });
  }
};
export const sendNotification = async (req, res) => {
  try {
    const { role, userId, message } = req.body;

    const query = {};
    if (role) query.role = role;
    if (userId) query.userId = userId;

    // Get all subscriptions
    const subscriptions = await PushNotificationSubscription.find(query);

    if (!subscriptions.length) {
      return res
        .status(404)
        .json({ success: false, message: "No subscriptions found" });
    }

    // Notification payload
    const payload = JSON.stringify({
      title: "🚀 New Notification",
      body: message,
      icon: `${process.env.FRONTEND_URL}/icons/icon-192x192.png`,
      url: `${process.env.FRONTEND_URL}`,
    });

    // Send to all subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (s) => {
        try {
          await webpush.sendNotification(s.subscription, payload);
        } catch (err) {
          console.error("Push failed:", err);
          // Remove invalid subscription
          if (err.statusCode === 410 || err.statusCode === 404) {
            await PushNotificationSubscription.deleteOne({
              userId: s.userId,
              "device.id": s.device.id,
            });
          }
        }
      })
    );

    return res.json({ success: true, sent: results.length });
  } catch (err) {
    console.error("Error sending notifications:", err);
   return res.status(500).json({ error: "Failed to send notifications" });
  }
};
