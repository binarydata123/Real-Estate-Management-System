"use client";
import React, { useEffect, useState } from "react";
import {
  BuildingOfficeIcon,
  UserIcon,
  CalendarIcon,
  BellIcon,
  ClockIcon,
  MapPinIcon,
  AdjustmentsHorizontalIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { showErrorToast } from "@/utils/toastHandler";
import Link from "next/link";
import { formatPrice } from "@/utils/helperFunction";
import { customerDashboard } from "@/lib/Customer/DashboardAPI";
import { timeFormatter } from "@/helper/timeFormatter";
import { useAuth } from "@/context/AuthContext";
import { useNotificationPermission } from "@/components/Common/pushNotification";
import { usePushSubscription } from "@/components/Common/SubscribeUserForNotification";

interface RecentActivity {
  _id: string;
  message: string;
  createdAt: string;
  type: string;
}

interface DashboardData {
  totalMeeting?: number;
  totalNotifications?: number;
  recentActivity?: RecentActivity[];
  totalSharedProperties?: number;
  totalAllProperties?: number;
  totalProperties?: number; // Unified field
  showAllProperty?: boolean; // Toggle state from backend
  latestSharedProperties?: {
    propertyId?: {
      _id: string;
      title: string;
      price: number;
      location: string;
      images: {
        url: string;
        alt: string;
        isPrimary: boolean;
        _id: string;
      }[];
    };
  }[];
}

export default function CustomerDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({});
  const { user } = useAuth();
  const { notificationPermission, requestNotificationPermission } =
    useNotificationPermission();
  const userId = user?._id;
  const role = user?.role;
  const { subscribeUserToPush } = usePushSubscription();
  const [isFetching, setIsFetching] = useState(false);

  const getDashboardData = async () => {
    setIsFetching(true);
    try {
      const res = await customerDashboard();

      if (res.success) {
        setDashboardData(res.data);
      }
    } catch (error) {
      showErrorToast("Error:", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      getDashboardData();
    }
  }, [user]);

  useEffect(() => {
    const init = async () => {
      if (notificationPermission !== "granted") {
        const permission = await requestNotificationPermission();
        if (permission === "granted" && userId && role) {
          await subscribeUserToPush(userId, role);
        }
      } else if (notificationPermission === "granted" && userId && role) {
        // Already granted → just subscribe
        await subscribeUserToPush(userId, role);
      }
    };

    init();
    // ✅ only run once on mount
  }, []);

  const userStats = [
    {
      title: "Properties",
      value: dashboardData?.totalProperties || 0,
      icon: BuildingOfficeIcon,
      color: "text-[#C9A24D]",
      href: "/customer/properties",
    },
    {
      title: "Meetings",
      value: dashboardData?.totalMeeting || 0,
      icon: CalendarIcon,
      color: "text-[#C9A24D]",
      href: "/customer/meetings",
    },
    {
      title: "Notifications",
      value: dashboardData?.totalNotifications || 0,
      icon: BellIcon,
      color: "text-[#C9A24D]",
      href: "/customer/notifications",
    },
  ];

  const quickActions = [
    {
      title: "Browse Properties",
      description: "Explore available properties",
      icon: BuildingOfficeIcon,
      color: "text-[#C9A24D]",
      href: "/customer/properties",
    },
    {
      title: "Check Preference",
      description: "Check property preferences",
      icon: AdjustmentsHorizontalIcon,
      color: "text-[#C9A24D]",
      href: "/customer/preferences",
    },
    {
      title: "Update Profile",
      description: "Manage your account details",
      icon: UserIcon,
      color: "text-[#C9A24D]",
      href: "/customer/profile",
    },
    {
      title: "Settings",
      description: "Manage your account settings",
      icon: Cog6ToothIcon,
      color: "text-[#C9A24D]",
      href: "/customer/settings",
    },
  ];

  const isGoogleMapsLink = (value?: string | number) => {
    if (!value || typeof value !== "string") return false;
    return (
      value.includes("google.com/maps") || value.includes("maps.google.com")
    );
  };

  const getImageUrl = (url: string) => {
    if (url.startsWith("http")) return url;
    return `${process.env.NEXT_PUBLIC_IMAGE_URL}/Properties/medium/${url}`;
  };

  const StatPill = ({ label, value }: { label: string; value: number }) => (
    <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-[#C9A24D]/30 shadow-[0_0_0_1px_rgba(201,162,77,0.15)]">
      <div className="w-2.5 h-2.5 rounded-full bg-[#C9A24D] shadow-[0_0_8px_rgba(201,162,77,0.8)]" />
      <span className="text-sm text-white/90">
        <span className="font-semibold text-white">{value}</span> {label}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F7FA] px-1 py-1">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-[8px] mb-4 bg-gradient-to-br from-[#0A2540] via-[#0E2F52] to-[#081C30] border border-[#C9A24D]/20">
        {/* Gold Accent Glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#C9A24D]/10 blur-3xl rounded-full" />

        {/* Content Container */}
        <div className="relative z-10 p-5 sm:p-6">
          {isFetching ? (
            <div className="space-y-4">
              <div className="h-8 w-56 rounded-lg bg-white/20 animate-pulse" />
              <div className="h-4 w-72 rounded-lg bg-white/20 animate-pulse" />
            </div>
          ) : (
            <div className="max-w-3xl">
              {/* Welcome Text */}
              <div className="mb-1">
                <h1 className="text-2xl sm:text-3xl font-semibold text-white flex items-center gap-2">
                  Welcome to{" "}
                  <span className="text-[#C9A24D]">{user?.agency?.name}</span>
                </h1>
              </div>

              <div className="mb-1">
                <p className="text-sm sm:text-base text-white/80">
                  Your trusted partner in buying and selling property.
                </p>
              </div>

              {/* Divider */}
              <div className="mt-4 mb-5 h-px w-32 bg-gradient-to-r from-[#C9A24D] to-transparent" />

              {/* Stats Preview */}
              {userStats && userStats.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  <StatPill
                    label={userStats[0]?.title}
                    value={userStats[0]?.value || 0}
                  />
                  {userStats[1] && (
                    <StatPill
                      label={userStats[1]?.title}
                      value={userStats[1]?.value || 0}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats Section */}
      <div
        className={`mb-4 transition-all duration-500 ${
          isFetching ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
        }`}
      >
        {isFetching ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-24 rounded-2xl bg-white/50 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {userStats.map((stat, index) => (
              <Link
                href={stat.href}
                key={index}
                className="bg-white rounded-xl shadow-lg py-3 px-1 md:p-6 hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex items-center gap-1 justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-[#0A2540] md:mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#C9A24D]/10">
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Grid - Recent Activity & Shared Properties */}
      <div
        className={`mb-3 transition-all duration-500 ${
          isFetching ? "opacity-0" : "opacity-100"
        }`}
      >
        {isFetching ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="h-64 rounded-2xl bg-white/50 animate-pulse" />
            <div className="h-64 rounded-2xl bg-white/50 animate-pulse" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-[#0A2540] to-[#0E2F52] px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">
                    Recent Activity
                  </h2>
                </div>
                <p className="text-white/80 text-sm mt-1">
                  Stay updated with your latest activities
                </p>
              </div>
              <div className="p-3 bg-gradient-to-b from-gray-50/30 to-white">
                <div className="space-y-1">
                  {dashboardData?.recentActivity &&
                  dashboardData.recentActivity.length > 0 ? (
                    dashboardData.recentActivity.map((activity) => (
                      <Link
                        href={"/customer/notifications"}
                        key={activity?._id}
                        className="flex items-center space-x-3 p-3 rounded-xl bg-white hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-300 border border-gray-100 hover:border-[#C9A24D]/30 hover:shadow-md"
                      >
                        <div className="h-10 w-10 bg-gradient-to-br from-[#0A2540] to-[#0E2F52] rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                          <ClockIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {activity?.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {timeFormatter(activity?.createdAt)}
                          </p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 bg-white rounded-xl border-2 border-dashed border-gray-200">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#0A2540] to-[#0E2F52] rounded-full flex items-center justify-center mb-3 shadow-lg">
                        <ClockIcon className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-gray-600 font-medium">
                        No recent activity
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        Your schedule is clear
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Shared Properties */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-[#0A2540] to-[#0E2F52] px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">
                    {user?.showAllProperty
                      ? "Latest Properties"
                      : "Shared Properties"}
                  </h2>
                  {dashboardData?.latestSharedProperties &&
                    dashboardData.latestSharedProperties.length > 0 && (
                      <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-[#C9A24D]/30">
                        <span className="text-white text-sm font-semibold">
                          {dashboardData.latestSharedProperties.length} active
                        </span>
                      </div>
                    )}
                </div>
                <p className="text-white/80 text-sm mt-1">
                  Highly engaged prospects
                </p>
              </div>
              <div className="p-3 bg-gradient-to-b from-gray-50/30 to-white">
                <div className="space-y-1">
                  {dashboardData?.latestSharedProperties &&
                  dashboardData.latestSharedProperties.length > 0 ? (
                    dashboardData.latestSharedProperties.map((property) => (
                      <Link
                        href={`/customer/properties/${property?.propertyId?._id}`}
                        key={property.propertyId?._id}
                        className="flex items-center space-x-4 p-3 bg-white border-l-4 border-[#C9A24D] rounded-xl hover:shadow-lg hover:border-[#B8914A] transition-all duration-300 group shadow-sm"
                      >
                        <div className="relative flex-shrink-0">
                          <img
                            src={getImageUrl(
                              property.propertyId?.images?.[0]?.url ||
                                "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg"
                            )}
                            alt={property.propertyId?.title as string}
                            className="h-16 w-16 object-cover rounded-lg shadow-md"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-800 group-hover:text-[#C9A24D] transition-colors truncate">
                            {property.propertyId?.title}
                          </h3>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <MapPinIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                            {isGoogleMapsLink(property.propertyId?.location) ? (
                              <a
                                href={String(property.propertyId?.location)}
                                target="blank"
                                rel="noopener noreferrer"
                                className="text-[#C9A24D] underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Get Direction
                              </a>
                            ) : property.propertyId?.location ? (
                              <span>{property.propertyId?.location}</span>
                            ) : (
                              <span className="text-gray-400 italic">
                                Not Provided Yet
                              </span>
                            )}
                          </div>
                          {property.propertyId?.price &&
                            property.propertyId?.price > 0 && (
                              <p className="text-base font-bold text-[#0A2540] mt-1">
                                {formatPrice(property.propertyId?.price)}
                              </p>
                            )}
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 bg-white rounded-xl border-2 border-dashed border-gray-200">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#0A2540] to-[#0E2F52] rounded-full flex items-center justify-center mb-3 shadow-lg">
                        <MapPinIcon className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-gray-600 font-medium">
                        {user?.showAllProperty
                          ? "No properties available"
                          : "No shared properties"}
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        Check back later for updates
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div
        className={`transition-all duration-500 ${
          isFetching ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="mb-3">
          {isFetching ? (
            <div className="flex items-center justify-between">
              <div className="h-8 w-48 rounded-lg bg-white/50 animate-pulse" />
            </div>
          ) : (
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-[#0A2540]">
                  Quick Actions
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Access frequently used features
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions Grid */}
        {isFetching ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-40 rounded-2xl bg-white/50 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <Link
                href={action.href}
                key={action.title}
                className="group relative overflow-hidden bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:border-[#C9A24D]/30"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex flex-col items-center text-center">
                  <div className="p-4 rounded-xl mb-4 bg-[#C9A24D]/10 group-hover:scale-110 transition-transform duration-300 shadow-md">
                    <action.icon className={`h-6 w-6 ${action.color}`} />
                  </div>
                  <h3 className="font-bold text-gray-900 group-hover:text-[#C9A24D] transition-colors mb-2">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}