import webPush from "web-push";
import PushNotificationSubscription from "../models/Common/PushNotificationSubscription.js";
import {
  FRONTEND_URL,
  VAPID_PRIVATE_KEY,
  VAPID_PUBLIC_KEY,
} from "../config/env.js";

// Configure web-push
console.log(VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
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
}) {
  const query = {};
  if (userId) query.userId = userId;
  if (role) query.role = role;

  // ✅ Get subscriptions
  const subscriptions = await PushNotificationSubscription.find(query);

  if (!subscriptions.length) {
    console.log("No subscriptions found for query:", query);
    return;
  }

  const payload = JSON.stringify({
    title,
    body: message,
    icon: `${FRONTEND_URL}/icons/app-icon-192.png`,
    url: `${FRONTEND_URL}${urlPath}`,
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
}
