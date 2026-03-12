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
import OpenClawWidget from "@/components/openClawWidget/OpenClawWidget";

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
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
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
        {/* <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#C9A24D] to-transparent" /> */}

        <div className="relative z-10 p-5 sm:p-6">
          {showSkeleton ? (
            <div className="space-y-4">
              <div className="h-8 w-56 rounded-lg bg-white/20 animate-pulse" />
              <div className="h-4 w-72 rounded-lg bg-white/20 animate-pulse" />
            </div>
          ) : (
            <div className="max-w-3xl">
              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-semibold text-white flex items-center gap-2">
                Welcome back
                <span className="text-[#C9A24D] capitalize">{user?.name}</span>
              </h1>

              {/* Subtitle */}
              <p className="mt-1 text-sm sm:text-base text-white/80">
                Here’s what’s happening with your properties today
              </p>

              {/* Divider */}
              <div className="mt-4 mb-5 h-px w-32 bg-gradient-to-r from-[#C9A24D] to-transparent" />

              {/* Quick Stats */}
              {dashboardData && (
                <div className="flex flex-wrap gap-3">
                  <StatPill
                    label="Total Meetings"
                    value={dashboardData.totalMeetings || 0}
                  />
                  <StatPill
                    label="Today's Meetings"
                    value={dashboardData.todayMeetings?.length || 0}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div
        className={`mb-4 transition-all duration-500 ${
          isLoading ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
        }`}
      >
        {showSkeleton ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-24 rounded-2xl bg-gradient-to-br from-[#ffffff60] to-[#ffffff30] animate-pulse"
              />
            ))}
          </div>
        ) : (
          <DashboardStats value={dashboardData ?? {}} />
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
            <div className="h-64 rounded-2xl bg-white/50 animate-pulse" />
            <div className="h-64 rounded-2xl bg-white/50 animate-pulse" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <TodaysReminders reminders={dashboardData?.todayMeetings ?? []} />
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
              <div className="h-8 w-48 rounded-lg bg-white/50 animate-pulse" />
              <div className="h-8 w-20 rounded-lg bg-white/50 animate-pulse" />
            </div>
          ) : (
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-[#0A2540]">
                  Recent Properties
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Your latest property listings
                </p>
              </div>
              <Link
                href="/agent/properties"
                className="group flex items-center gap-2 px-4 py-2.5 bg-[#C9A24D] text-white rounded-xl hover:bg-[#B8914A] transition-colors duration-300 shadow-md hover:shadow-lg"
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
                className="h-72 rounded-2xl bg-white/50 animate-pulse"
              />
            ))}
          </div>
        ) : (dashboardData?.recentProperties ?? []).length > 0 ? (
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
          <div className="flex flex-col items-center justify-center py-12 px-4 bg-white rounded-2xl shadow-lg border border-gray-200">
            <div className="w-20 h-20 mb-4 rounded-full bg-[#F5F7FA] flex items-center justify-center">
              <Plus className="w-10 h-10 text-[#0A2540]" />
            </div>
            <p className="text-lg font-medium text-[#0A2540] mb-2">
              No Properties Added Yet
            </p>
            <p className="text-sm text-gray-600 mb-3 text-center">
              Start by adding your first property listing
            </p>
            <Link href="/agent/properties">
              <button className="group flex items-center gap-2 px-6 py-3 bg-[#C9A24D] text-white rounded-xl hover:bg-[#B8914A] transition-colors duration-300 shadow-lg hover:shadow-xl font-medium">
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

      <OpenClawWidget/>
    </div>
  );
};
