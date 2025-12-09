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
// import Image from "next/image";
import { showErrorToast } from "@/utils/toastHandler";
import Link from "next/link";
import { formatPrice } from "@/utils/helperFunction";
import { customerDashboard } from "@/lib/Customer/DashboardAPI";
import { timeFormatter } from "@/helper/timeFormatter";
import { useAuth } from "@/context/AuthContext";
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

  const getDashboardData = async () => {
    try {
      const res = await customerDashboard();
      
      if (res.success) {
        setDashboardData(res.data);
      }
    } catch (error) {
      showErrorToast("Error:", error);
    }
  };
  // useEffect(() => {
  //   getDashboardData();
  // }, []);


  useEffect(() => {
    if (user?._id) {
      getDashboardData();
    }
  }, [user]);





  const userStats = [
    {
      title: "Properties ",
      value: dashboardData?.totalSharedProperties || 0,
      icon: BuildingOfficeIcon,
      color: "text-blue-600",
      href: "/customer/properties",
    },
    {
      title: "Meetings ",
      value: dashboardData?.totalMeeting || 0,
      icon: CalendarIcon,
      color: "text-green-600",
      href: "/customer/meetings",
    },
    {
      title: "Notifications",
      value: dashboardData?.totalNotifications || 0,
      icon: BellIcon,
      color: "text-orange-600",
      href: "/customer/notifications",
    },
  ];

  const quickActions = [
    {
      title: "Browse Properties",
      description: "Explore available properties",
      icon: BuildingOfficeIcon,
      color: "text-blue-600",
      href: "/customer/properties",
    },
    {
      title: "Check Preference",
      description: "Check  property preferences",
      icon: AdjustmentsHorizontalIcon,
      color: "text-green-600",
      href: "/customer/preferences",
    },
    {
      title: "Update Profile",
      description: "Manage your account details",
      icon: UserIcon,
      color: "text-purple-600",
      href: "/customer/profile",
    },
    {
      title: "Settings",
      description: "Manage your account settings",
      icon: Cog6ToothIcon,
      color: "text-orange-600",
      href: "/customer/settings",
    },
  ];

  const getImageUrl = (url: string) => {
    if (url.startsWith("http")) return url;
    return `${process.env.NEXT_PUBLIC_IMAGE_URL}/Properties/medium/${url}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 ">
      <div className="max-w-7xl mx-auto space-y-3 md:space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Welcome to {user?.agency?.name}
          </h1>
          <p className="text-gray-600">
            Your trusted partner in buying and selling property.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {userStats.map((stat, index) => (
            <Link
              href={stat.href}
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 md:p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 md:mt-2">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`p-3 rounded-lg ${stat.color
                    .replace("text", "bg")
                    .replace("-600", "-100")}`}
                >
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-3 md:p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Activity
              </h2>
            </div>
            <div className="p-3 md:p-6">
              <div className="space-y-2 md:space-y-4">
                {dashboardData?.recentActivity &&
                dashboardData.recentActivity.length > 0 ? (
                  dashboardData.recentActivity.map((activity) => (
                    <Link
                      href={"/customer/notifications"}
                      key={activity?._id}
                      className="flex items-center space-x-3"
                    >
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <ClockIcon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          {activity?.message}
                        </p>
                        <p className="text-xs text-gray-500">
                          {timeFormatter(activity?.createdAt)}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    No recent activity to show.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Shared Properties */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-3 md:p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Shared Properties
              </h2>
            </div>
            <div className="p-3 md:p-6">
              <div className="space-y-2 md:space-y-4">
                {dashboardData?.latestSharedProperties &&
                dashboardData.latestSharedProperties.length > 0 ? (
                  dashboardData.latestSharedProperties.map((property) => (
                    <Link
                      href={`/customer/properties/${property?.propertyId?._id}`}
                      key={property.propertyId?._id}
                      className="flex items-center space-x-4 p-3 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-blue-300 transition-all duration-300 group"
                    >
                      {/* <Image
                        width={60}
                        height={60}
                        src={getImageUrl(property.propertyId?.images?.[0]?.url || "/placeholder.jpg")}
                        alt={property.propertyId?.title as string}
                        className="h-15 w-15 object-cover rounded-lg flex-shrink-0"
                      /> */}

                      <img
                        src={getImageUrl(
                          property.propertyId?.images?.[0]?.url ||
                            "/placeholder.jpg"
                        )}
                        alt={property.propertyId?.title as string}
                        className="h-15 w-15 object-cover rounded-lg flex-shrink-0"
                      />

                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                          {property.propertyId?.title}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPinIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                          <span className="truncate">
                            {property.propertyId?.location || "N/A"}
                          </span>
                        </div>
                        {property.propertyId?.price &&
                          property.propertyId?.price > 0 && (
                            <p className="text-lg font-bold text-blue-700 mt-1">
                              {formatPrice(property.propertyId?.price)}
                            </p>
                          )}
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    No Shared properties to show.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-3 md:p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Quick Actions
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 p-3 md:p-6">
            {quickActions.map((action) => (
              <Link
                href={action.href}
                key={action.title}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center text-center"
              >
                <div
                  className={`p-3 rounded-lg mb-3 ${action.color
                    .replace("text", "bg")
                    .replace("-600", "-100")}`}
                >
                  <action.icon className={`h-6 w-6 ${action.color}`} />
                </div>
                <h3 className="font-medium text-gray-900">{action.title}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {action.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
