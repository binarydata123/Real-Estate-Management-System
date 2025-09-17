"use client";

import { useState, useCallback } from "react";

export function useNotificationPermission() {
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("default");

  const requestNotificationPermission = useCallback(async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        return permission;
      } catch (error) {
        console.warn("[PWA] Notification permission request failed:", error);
        setNotificationPermission("denied");
        return "denied";
      }
    }
    return "denied";
  }, []);

  return { notificationPermission, requestNotificationPermission };
}
