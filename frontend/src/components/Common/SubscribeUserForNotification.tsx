"use client";
import Cookies from 'js-cookie';
import { useCallback } from "react";
import { detectDevice } from "./DetectDevice";
import { savePushSubscription } from "@/lib/Common/SubscribeUserNotification";

function getOrCreateDeviceId(): string {
  let id = Cookies.get("deviceId");
  if (!id) {
    id = crypto.randomUUID();
    Cookies.set("deviceId", id);
  }
  return id;
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
}

export function usePushSubscription() {
  const subscribeUserToPush = useCallback(
    async (userId: string, role: string) => {
      if (!userId || !role) return null;
      if (!("serviceWorker" in navigator)) return null;

      try {
        // ✅ Register the service worker
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        // ✅ Check for existing subscription
        let subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
              process.env.NEXT_PUBLIC_VAPID_PUBLIC as string
            ),
          });
        }

        // ✅ Collect device info
        const device = {
          ...detectDevice(),
          id: getOrCreateDeviceId(),
        };

        await savePushSubscription({
          userId,
          role,
          subscription,
          device,
        });

        return subscription;
      } catch (err) {
        console.error("[PWA] Push subscription failed:", err);
        return null;
      }
    },
    []
  );

  return { subscribeUserToPush };
}
