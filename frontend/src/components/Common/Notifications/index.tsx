"use client";
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Bell,
  UserPlus,
  ClipboardList,
  Calendar,
  Home,
  PlusCircle,
  CheckCheck,
} from "lucide-react";
import {
  getNotifications,
  getUnreadNotificationsCount,
  markAllAsRead,
  markAsRead,
  NotificationType,
} from "@/lib/Common/Notifications";
import { useAuth } from "@/context/AuthContext";
import { Pagination } from "@/components/Common/Pagination";

const typeConfig: Record<
  NotificationType["type"],
  { icon: React.ReactNode; color: string; label: string }
> = {
  welcome: {
    icon: <Bell className="w-5 h-5 text-blue-500" />,
    color: "bg-blue-100 border-blue-300",
    label: "Welcome",
  },
  new_lead: {
    icon: <UserPlus className="w-5 h-5 text-green-500" />,
    color: "bg-green-100 border-green-300",
    label: "New Lead",
  },
  task_assigned: {
    icon: <ClipboardList className="w-5 h-5 text-purple-500" />,
    color: "bg-purple-100 border-purple-300",
    label: "Task Assigned",
  },
  meeting_scheduled: {
    icon: <Calendar className="w-5 h-5 text-orange-500" />,
    color: "bg-orange-100 border-orange-300",
    label: "Meeting Scheduled",
  },
  property_updated: {
    icon: <Home className="w-5 h-5 text-indigo-500" />,
    color: "bg-indigo-100 border-indigo-300",
    label: "Property Updated",
  },
  property_added: {
    icon: <PlusCircle className="w-5 h-5 text-pink-500" />,
    color: "bg-pink-100 border-pink-300",
    label: "Property Added",
  },
};

type NotificationFilter =
  | "welcome"
  | "new_lead"
  | "task_assigned"
  | "meeting_scheduled"
  | "property_updated"
  | "property_added"
  | "unread";

type TabType = NotificationFilter | "all";

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState<TabType>("all");

  const tabs: { key: TabType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread" },
    { key: "meeting_scheduled", label: "Meetings" },
    { key: "property_added", label: "Property" },
    { key: "new_lead", label: "Customer" },
  ];

  const fetchNotifications = async () => {
    try {
      if (!user?._id) return;

      // map "all" to undefined for API
      const typeParam: NotificationFilter | undefined =
        activeTab === "all" ? undefined : activeTab;

      const res = await getNotifications(user?._id, {
        type: typeParam,
        page: currentPage,
        limit: 10,
      });

      setNotifications(res.data.data || []);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchNotifications();
  };

  const fetchUnreadCount = async () => {
    try {
      if (!user?._id) return;
      const res = await getUnreadNotificationsCount();
      setUnreadCount(res.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [activeTab]); // 👈 refetch when tab changes

  const handleReadNotification = async (id: string) => {
    const result = await markAsRead(id);
    if (result.data.success) {
      fetchNotifications();
      fetchUnreadCount();
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

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center text-gray-500">
        Loading notifications...
      </div>
    );
  }

  return (
    <div className="space-y-2 w-full md:w-3/5 mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Notifications{unreadCount > 0 && ` (${unreadCount})`}
          </h1>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => {
              if (user?._id) {
                handleMarkAllRead();
              }
            }}
            className="flex items-center gap-2 md:px-4 px-3 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all"
          >
            <CheckCheck className="h-5 w-5" />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-t-lg ${activeTab === tab.key
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications */}
      {notifications.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          No notifications for this tab
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => {
            const config = typeConfig[notification.type];
            return (
              <div
                key={notification._id}
                onClick={() => {
                  if (!notification.read) {
                    handleReadNotification(notification._id);
                  }
                }}
                className={`flex items-start p-4 border rounded-xl shadow-sm ${config?.color}`}
              >
                <div className="flex-shrink-0 mr-3">{config?.icon}</div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(
                      new Date(notification.createdAt),
                      "MMM dd, yyyy hh:mm a"
                    )}
                  </p>
                </div>
                {!notification.read && (
                  <span className="ml-3 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </div>
            );
          })}
        </div>
      )}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        siblingCount={1}
        showFirstLast={true}
        showPrevNext={true}
      />
    </div>
  );
};

export default NotificationsPage;
