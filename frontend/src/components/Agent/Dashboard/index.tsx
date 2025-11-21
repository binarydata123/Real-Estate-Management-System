/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import DashboardStats from "./DashboardStats";
import TodaysReminders, { Reminder } from "./TodaysReminders";
import PropertyCardForDashboard from "./PropertyCardForDashboard";
import PropertyDetailModal from "../Common/PropertyDetailModal";
import SharePropertyModal from "../Common/SharePropertyModal";
import Link from "next/link";
import { useNotificationPermission } from "@/components/Common/pushNotification";
import { usePushSubscription } from "@/components/Common/SubscribeUserForNotification";
import { useAuth } from "@/context/AuthContext";
import { getDashboardData } from "@/lib/Dashboard/DashboarAPI";
import { showErrorToast } from "@/utils/toastHandler";
import HotCustomers from "./HotCustomers";

export interface customer {
  _id: string;
  fullName: string;
  maximumBudget?: number;
  minimumBudget?: number;
}

interface DashboardData {
  totalMeetings: number;
  todayMeetings: Reminder[];
  topCustomers: customer[]; // object
  recentProperties:[]
}

export const AgentDashboard = () => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [showShareModal, setShowShareModal] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );

  const getData = async () => {
    try {
      const res = await getDashboardData();
      if (res.success) {
        setDashboardData(res.data);
      }
    } catch (error) {
      showErrorToast("Error", error);
    }
  };

  useEffect(() => {
    getData();
  }, []);
  
  const [propertyToShare, setPropertyToShare] = useState<Property | null>(null);

  const handleViewProperty = (property: Property) => {
    setSelectedProperty(property);
  };

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
        // Already granted → just subscribe
        await subscribeUserToPush(userId, role);
      }
    };

    init();
    // ✅ only run once on mount
  }, []);

  return (
    <div className="space-y-2 md:space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 md:mb-2">
          Welcome back!
        </h1>
        <p className="text-gray-600">
          Here&apos;s what&apos;s happening with your properties today.
        </p>
      </div>

      {/* Stats */}
      <DashboardStats value={dashboardData ?? {}} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 md:gap-8 gap-2">
        <TodaysReminders reminders={dashboardData?.todayMeetings ?? []} />
        <HotCustomers customers={dashboardData?.topCustomers ?? []} />
      </div>

      {/* Recent Properties */}
      <div>
        <div className="flex items-center justify-between mb-2 md:mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Recent Properties
          </h2>
          <Link
            href="/agent/properties"
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            View All
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-2 gap-2 md:gap-6">
          {dashboardData?.recentProperties?.map((property) => (
            <PropertyCardForDashboard
              key={property._id}
              property={property}
              onView={handleViewProperty}
              onShare={handleShareProperty}
            />
          ))}
        </div>
      </div>

      {/* Property Detail Modal */}
      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onShare={(property) => {
            setSelectedProperty(null);
            handleShareProperty(property);
          }}
        />
      )}

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
