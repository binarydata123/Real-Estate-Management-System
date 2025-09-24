import webPush from "web-push";
import PushNotificationSubscription from "../models/Common/PushNotificationSubscription.js";
import {
  FRONTEND_URL,
  VAPID_PRIVATE_KEY,
  VAPID_PUBLIC_KEY,
} from "../config/env.js";

webPush.setVapidDetails(
  "mailto:binarydata.code@mail.com",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

export async function sendPushNotification({
  userId,
  role,
  title,
  message,
  urlPath,
  data = {},
  actions = [],
}) {
  const query = {};
  if (userId) query.userId = userId;
  if (role) query.role = role;

  // ✅ Get subscriptions
  const subscriptions = await PushNotificationSubscription.find(query);

  if (!subscriptions.length) {
    const message = `No subscriptions found for query: ${JSON.stringify(
      query
    )}`;
    console.log(message);
    return { success: false, message, sent: 0 };
  }

  const payload = JSON.stringify({
    title,
    body: message,
    icon: `${FRONTEND_URL}/icons/app-icon-192.png`,
    actions,
    data: {
      ...data,
      url: `${FRONTEND_URL}${urlPath}`,
      userId,
    },
  });

  await Promise.allSettled(
    subscriptions.map((s) =>
      webPush.sendNotification(s.subscription, payload).catch(async (err) => {
        console.error("Push failed:", err.message);
        if (err.statusCode === 410 || err.statusCode === 404) {
          await PushNotificationSubscription.deleteOne({
            userId: s.userId,
            "device.id": s.device.id,
          });
        }
      })
    )
  );

  console.log(`✅ Sent push to ${subscriptions.length} subscribers`);
  return {
    success: true,
    message: `Sent push to ${subscriptions.length} subscribers`,
    sent: subscriptions.length,
  };
}
