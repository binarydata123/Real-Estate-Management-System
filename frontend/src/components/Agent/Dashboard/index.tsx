"use client";
import React, { useEffect, useState } from "react";
import DashboardStats from "./DashboardStats";
import TodaysReminders, { Reminder } from "./TodaysReminders";
import PropertyCardForDashboard from "./PropertyCardForDashboard";
import SharePropertyModal from "../Common/SharePropertyModal";
import Link from "next/link";
import { useNotificationPermission } from "@/components/Common/pushNotification";
import { usePushSubscription } from "@/components/Common/SubscribeUserForNotification";
import { useAuth } from "@/context/AuthContext";
import { getDashboardData } from "@/lib/Agent/DashboarAPI";
import { showErrorToast } from "@/utils/toastHandler";
import HotCustomers from "./HotCustomers";
import { Plus } from "lucide-react";

export interface customer {
  _id: string;
  fullName: string;
  maximumBudget?: number;
  minimumBudget?: number;
}

interface DashboardData {
  totalMeetings: number;
  todayMeetings: Reminder[];
  topCustomers: customer[];
  recentProperties: [];
}

export const AgentDashboard = () => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [isLoading, setIsLoading] = useState(true);


  const getData = async () => {
    setShowSkeleton(true);
    setIsLoading(true);
    try {
      const res = await getDashboardData();
      if (res.success) {
        setDashboardData(res.data);
      }
    } catch (error) {
      showErrorToast("Error", error);
    } finally {
      setShowSkeleton(false);
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const [propertyToShare, setPropertyToShare] = useState<Property | null>(null);

  const handleShareProperty = (property: Property) => {
    setPropertyToShare(property);
    setShowShareModal(true);
  };
  
  const { notificationPermission, requestNotificationPermission } =
    useNotificationPermission();
  const { subscribeUserToPush } = usePushSubscription();
  const { user } = useAuth();
  const userId = user?._id;
  const role = user?.role;
  
  useEffect(() => {
    const init = async () => {
      if (notificationPermission !== "granted") {
        const permission = await requestNotificationPermission();
        if (permission === "granted" && userId && role) {
          await subscribeUserToPush(userId, role);
        }
      } else if (notificationPermission === "granted" && userId && role) {
        await subscribeUserToPush(userId, role);
      }
    };

    init();
  }, []);

return (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 px-1 py-1">
    {/* Welcome Section - Text appears immediately with blinking cursor */}
    <div className="relative overflow-hidden rounded-3xl mb-3">
      {/* Gradient Background Only */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 opacity-90"></div>

      {/* Content Container */}
      <div className="relative z-10 p-4">
        {showSkeleton ? (
          <div className="space-y-3">
            <div className="h-8 sm:h-10 w-48 sm:w-64 rounded-xl bg-white/30 animate-pulse" />
            <div className="h-4 w-64 sm:w-80 rounded-xl bg-white/30 animate-pulse" />
          </div>
        ) : (
          <div className="max-w-2xl">
            {/* Welcome Text - Appears immediately */}
            <div className="mb-1">
              <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-xl font-bold text-white inline-flex items-center">
                Welcome back!
              </h1>
            </div>

            <div className="mb-3">
              <p className="text-xl sm:text-lg md:text-xl lg:text-xl text-white/90 inline-flex items-center">
                {"Here's what's happening with your properties today."}
              </p>
            </div>

            {/* Stats Preview - Appears immediately */}
            {dashboardData && (
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-xl">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white text-xs sm:text-sm font-medium">
                    {dashboardData.totalMeetings || 0} Total Meetings
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-xl">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-white text-xs sm:text-sm font-medium">
                    {dashboardData.todayMeetings?.length || 0} Today&apos;s
                    Meetings
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>

    {/* Stats Section */}
    <div
      className={`mb-3 transition-all duration-500 ${
        isLoading ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
      }`}
    >
      {showSkeleton ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-24 rounded-2xl bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div>
          <DashboardStats value={dashboardData ?? {}} />
        </div>
      )}
    </div>

    {/* Main Content Grid - Today's Meetings & Hot Customers */}
    <div
      className={`mb-3 transition-all duration-500 ${
        isLoading ? "opacity-0" : "opacity-100"
      }`}
    >
      {showSkeleton ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="h-64 rounded-2xl bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
          <div className="h-64 rounded-2xl bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Today's Meetings - Display directly without animations */}
          <TodaysReminders reminders={dashboardData?.todayMeetings ?? []} />

          {/* Hot Customers */}
          <HotCustomers customers={dashboardData?.topCustomers ?? []} />
        </div>
      )}
    </div>

    {/* Recent Properties */}
    <div
      className={`transition-all duration-500 ${
        isLoading ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="mb-3">
        {showSkeleton ? (
          <div className="flex items-center justify-between">
            <div className="h-8 w-48 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
            <div className="h-8 w-20 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
          </div>
        ) : (
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                Recent Properties
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Your latest property listings
              </p>
            </div>
            <Link
              href="/agent/properties"
              className="group flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-secondary transition-colors duration-300 shadow-md hover:shadow-lg"
            >
              <span className="font-medium text-sm">View All</span>
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        )}
      </div>

      {/* Properties Grid */}
      {showSkeleton ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-72 rounded-2xl bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse"
            />
          ))}
        </div>
      ) :  (dashboardData?.recentProperties ?? []).length > 0 ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
             {dashboardData?.recentProperties?.map((property: Property) => (
              <PropertyCardForDashboard
                 key={property._id}
                 property={property}
                 onShare={handleShareProperty}    
                    />
           ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-4 bg-white rounded-2xl shadow-lg">
          <div className="w-20 h-20 mb-4 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
            <Plus className="w-10 h-10 text-blue-600" />
          </div>
          <p className="text-lg font-medium text-gray-700 mb-2">
            No Properties Added Yet
          </p>
          <p className="text-sm text-gray-500 mb-3 text-center">
            Start by adding your first property listing
          </p>
          <Link href="/agent/properties">
            <button className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-colors duration-300 shadow-lg hover:shadow-xl font-medium">
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              Add Your First Property
            </button>
          </Link>
        </div>
      )}
    </div>

    {/* Share Property Modal */}
    {showShareModal && propertyToShare && (
      <SharePropertyModal
        property={propertyToShare}
        onClose={() => {
          setShowShareModal(false);
          setPropertyToShare(null);
        }}
      />
    )}
  </div>
);

};