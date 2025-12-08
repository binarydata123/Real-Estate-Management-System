import React, { useEffect, useRef, useState } from "react";
import { BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import {
  getNotifications,
  getUnreadNotificationsCount,
  markAllAsRead,
  markAsRead,
  NotificationType,
} from "@/lib/Common/Notifications";
import { showErrorToast } from "@/utils/toastHandler";

interface Notification {
  id: string;
  title: string;
  message: string;
  type:
    | "meeting_reminder"
    | "property_shared"
    | "customer_activity"
    | "system_update"
    | string;
  read_at: string | null;
  created_at: string;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  const fetchNotifications = async () => {
    try {
      if (!user?._id) return;

      const res = await getNotifications(user?._id, {
        type: "unread",
        page: 1,
        limit: 10,
      });

      setNotifications(res.data.data || []);
    } catch (err) {
      showErrorToast("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      if (!user?._id) return;
      const res = await getUnreadNotificationsCount();
      setUnreadCount(res.data);
    } catch (err) {
      showErrorToast("Error fetching notifications:", err);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification._id === notificationId
          ? { ...notification, read_at: new Date().toISOString() }
          : notification
      )
    );
    try {
      await markAsRead(notificationId);
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      showErrorToast("Error", error);
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    const result = await markAllAsRead();
    if (result.data.success) {
      fetchNotifications();
      fetchUnreadCount();
    }
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "meeting_reminder":
        return "📅";
      case "property_shared":
        return "🏠";
      case "customer_activity":
        return "👤";
      case "system_update":
        return "🔔";
      default:
        return "📢";
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose(); // Close if clicked outside modal
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-start justify-end pt-16 p-4 z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg md:rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden  md:mr-12"
      >
        {/* Header */}
        <div className="border-b border-gray-200 p-2 md:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BellIcon className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Notifications
              </h2>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-primary hover:text-primary text-sm font-medium"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto max-h-96">
          {loading && (
            <div className="p-8 text-center">
              <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Loading notifications...</p>
            </div>
          )}
          {notifications.length > 0 && !loading ? (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !notification.read ? "bg-blue-50" : ""
                  }`}
                  onClick={() => handleMarkAsRead(notification._id)}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-lg">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p
                          className={`text-sm font-medium ${
                            !notification.read
                              ? "text-gray-900"
                              : "text-gray-700"
                          }`}
                        >
                          {notification.type}
                        </p>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 md:mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {format(
                          new Date(notification.createdAt),
                          "MMM dd, hh:mm a"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="flex flex-col items-center text-center py-8">
                <BellIcon className="h-12 w-12 text-gray-300" />
                <h3 className="mt-4 text-lg font-semibold text-gray-800">
                  You&apos;re all caught up!
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  New notifications will appear here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
