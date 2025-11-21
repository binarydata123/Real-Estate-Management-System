/* eslint-disable @typescript-eslint/no-explicit-any */
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
}

export const AgentDashboard = () => {
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
  const recentProperties: any[] = [
    {
      id: "1",
      title: "Luxury 3BHK Apartment",
      type: "residential",
      category: "flat",
      location: "Bandra West,Auto Market, New Mumbai",
      price: 7500000,
      size: 1200,
      size_unit: "sq ft",
      bedrooms: 3,
      bathrooms: 2,
      status: "available",
      images: [
        {
          _id: "",
          url: "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg",
          alt: "Luxury 3BHK Apartment",
          isPrimary: true,
        },
      ],
      created_at: "2025-01-09T10:00:00Z",
      description:
        "Beautiful 3BHK apartment with modern amenities, spacious rooms, and excellent connectivity.",
    },
    {
      id: "2",
      title: "Premium Commercial Office",
      type: "commercial",
      category: "office",
      location: "Andheri East, Mumbai",
      price: 12000000,
      size: 800,
      size_unit: "sq ft",
      status: "available",
      images: [
        {
          _id: "",
          url: "https://images.pexels.com/photos/373912/pexels-photo-373912.jpeg",
          alt: "Premium Commercial Office",
          isPrimary: true,
        },
      ],
      created_at: "2025-01-08T14:30:00Z",
      description:
        "Premium commercial office space in prime location with modern infrastructure.",
    },
  ];
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
          {recentProperties.map((property) => (
            <PropertyCardForDashboard
              key={property.id}
              property={property}
              onShare={handleShareProperty}
            />
          ))}
        </div>
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
