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
import ScrollPagination from "@/components/Common/ScrollPagination";
import { showErrorToast } from "@/utils/toastHandler";

const typeConfig: Record<
  NotificationType["type"],
  { icon: React.ReactNode; color: string; label: string }
> = {
  welcome: {
    icon: <Bell className="w-5 h-5 text-white" />,
    color: "bg-blue-500",
    label: "Welcome",
  },
  new_lead: {
    icon: <UserPlus className="w-5 h-5 text-white" />,
    color: "bg-green-500",
    label: "New Lead",
  },
  task_assigned: {
    icon: <ClipboardList className="w-5 h-5 text-white" />,
    color: "bg-purple-500",
    label: "Task Assigned",
  },
  meeting_scheduled: {
    icon: <Calendar className="w-5 h-5 text-white" />,
    color: "bg-orange-500",
    label: "Meeting Scheduled",
  },
  property_updated: {
    icon: <Home className="w-5 h-5 text-white" />,
    color: "bg-indigo-500",
    label: "Property Updated",
  },
  property_added: {
    icon: <PlusCircle className="w-5 h-5 text-white" />,
    color: "bg-pink-500",
    label: "Property Added",
  },
};

type NotificationFilter =
  | "all"
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
  const [isFetching, setIsFetching] = useState(true);
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

  useEffect(() => {
    setNotifications([]); // Clear notifications when tab changes
    setCurrentPage(1);
    fetchNotifications(1);
    fetchUnreadCount();
  }, [activeTab]);

  const fetchNotifications = async (page = 1, append = false) => {
    setIsFetching(true);
    try {
      if (!user?._id) return;
      const typeParam: NotificationFilter = activeTab;

      const res = await getNotifications(user?._id, {
        type: typeParam,
        page: page,
        limit: 10,
      });

      setNotifications((prev) =>
        append ? [...prev, ...(res.data.data || [])] : res.data.data || []
      );
      setTotalPages(res.data.pagination.totalPages);
      setCurrentPage(res.data.pagination.page);
    } catch (err) {
      showErrorToast("Error", err);
    } finally {
      setIsFetching(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      if (!user?._id) return;
      const res = await getUnreadNotificationsCount();
      setUnreadCount(res.data);
    } catch (err) {
      showErrorToast("Error", err);
    }
  };

  const handlePageChange = (page: number) => {
    if (page > totalPages || isFetching) return;
    fetchNotifications(page, true);
  };

  const handleReadNotification = async (id: string) => {
    const result = await markAsRead(id);
    if (result.data.success) {
      fetchNotifications(1); // Refetch from page 1
      fetchUnreadCount();
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    const result = await markAllAsRead();
    if (result.data.success) {
      fetchNotifications(1); // Refetch from page 1
      fetchUnreadCount();
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Notifications
            </h1>
            <p className="text-gray-500 mt-1">
              You have {unreadCount > 0 ? `${unreadCount} unread` : "no unread"}{" "}
              messages.
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => {
                if (user?._id) {
                  handleMarkAllRead();
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-sm hover:bg-primary/80 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all"
            >
              <CheckCheck className="h-5 w-5" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>

        <div className="p-6">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6 overflow-x-auto scrollbar-hide">
            <nav
              className="flex space-x-6 whitespace-nowrap px-1 min-w-max"
              aria-label="Tabs"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.key
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Notifications List */}
          {isFetching && notifications.length === 0 ? (
            <div className="text-center py-20">
              <div className="loader border-t-4 border-b-4 border-blue-600 w-12 h-12 rounded-full mx-auto animate-spin mb-4"></div>
              <p className="text-gray-600">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-20">
              <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                You&apos;re all caught up!
              </h3>
              <p className="text-gray-500">
                New notifications will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4 h-[60vh] overflow-auto">
              {notifications.map((notification) => {
                const config = typeConfig[notification.type];
                return (
                  <div
                    key={notification._id}
                    onClick={() =>
                      !notification.read &&
                      handleReadNotification(notification._id)
                    }
                    className={`relative flex items-start p-4 border-l-4 rounded-lg  bg-white hover:bg-gray-50 transition-colors cursor-pointer ${
                      notification.read
                        ? "border-transparent"
                        : "border-blue-500"
                    }`}
                  >
                    {config && (
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4 ${config.color}`}
                      >
                        {config.icon}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(
                          new Date(notification.createdAt),
                          "MMM dd, yyyy 'at' hh:mm a"
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <ScrollPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            isLoading={isFetching}
            hasMore={currentPage < totalPages}
            loader={
              <div className="text-center py-6">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            }
            endMessage={
              <div className="text-center py-8 text-gray-500 font-medium">
                🎉 You&apos;ve reached the end!
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
