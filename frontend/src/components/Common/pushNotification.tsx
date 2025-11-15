"use client";

import { showErrorToast } from "@/utils/toastHandler";
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
        showErrorToast("[PWA] Notification permission request failed:", error);
        return "denied";
      }
    }
    return "denied";
  }, []);

  return { notificationPermission, requestNotificationPermission };
}
