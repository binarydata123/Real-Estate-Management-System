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
  topCustomers: customer[]; // object
  recentProperties: [];
}

export const AgentDashboard = () => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [showSkeleton, setShowSkeleton] = useState(false);
  const getData = async () => {
    setShowSkeleton(true);
    try {
      const res = await getDashboardData();
      if (res.success) {
        setDashboardData(res.data);
      }
    } catch (error) {
      showErrorToast("Error", error);
    } finally {
      setShowSkeleton(false);
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
        // Already granted → just subscribe
        await subscribeUserToPush(userId, role);
      }
    };

    init();
    //only run once on mount
  }, []);

  // const DashboardSkeleton = () => (
  //   <p>Skeleton Will Come Here!</p>
  // )

  return (
    <div className="space-y-2 md:space-y-8">
      {/* Welcome Section */}

      {showSkeleton ? (
        <div className="space-y-2">
          <div className="h-8 w-52 rounded-md bg-gray-200 animate-pulse" />
          <div className="h-4 w-80 rounded-md bg-gray-200 animate-pulse" />
        </div>
      ) : (
        <div>
          <h1 className="text-3xl font-bold text-gray-900 md:mb-2">
            Welcome back!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here&apos;s what&apos;s happening with your properties today.
          </p>
        </div>
      )}

      {/* Stats */}
      {showSkeleton ? (
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-12 w-[30vw] rounded-lg bg-gray-200 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <DashboardStats value={dashboardData ?? {}} />
      )}

      {/* Main Content Grid */}
      {showSkeleton ? (
        <>
          <div className="h-[130px] w-full bg-gray-200 "></div>
          <div className="h-[130px] w-full bg-gray-200 "></div>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 md:gap-8 gap-2">
          <TodaysReminders reminders={dashboardData?.todayMeetings ?? []} />
          <HotCustomers customers={dashboardData?.topCustomers ?? []} />
        </div>
      )}

      {/* Recent Properties */}
      <div>
        {showSkeleton ? (
          <div className="h-[20px] flex items-center justify-between">
            <div className="w-[100px] h-[20px] bg-gray-200"></div>
            <div className="w-[60px] h-[20px] bg-gray-200"></div>
          </div>
        ) : (
          <div className="flex items-center justify-between mb-2 md:mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Properties
            </h2>
            <Link
              href="/agent/properties"
              className="text-primary hover:text-secondary font-medium text-sm"
            >
              View All
            </Link>
          </div>
        )}
        {showSkeleton ? (
          <div className="flex mt-4 gap-3 h-[150px]">
            <div className="h-full w-[48%] bg-gray-200"></div>
            <div className="h-full w-[48%] bg-gray-200"></div>
          </div>
        ) : (dashboardData?.recentProperties ?? []).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData?.recentProperties?.map((property: Property) => (
              <PropertyCardForDashboard
                key={property._id}
                property={property}
                onShare={handleShareProperty}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2 w-full h-[100px] justify-center items-center">
            <p className="text-sm text-gray-500">No Property Added</p>

            <Link href={"/agent/properties"}>
              <button className="cursor-pointer flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-400 transition leading-none">
                Add Here
                <span className="flex items-center">
                  <Plus className="!w-[10px] !h-[10px]" />
                </span>
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
