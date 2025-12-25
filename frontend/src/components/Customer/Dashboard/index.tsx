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
      // value: getPropertyCount(), // Use dynamic count based on toggle
      value: dashboardData?.totalProperties||0,
      icon: BuildingOfficeIcon,
      color: "text-blue-600",
      href: "/customer/properties",
    },
    {
      title: "Meetings",
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
      description: "Check property preferences",
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
   <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 px-1 py-1">
     {/* Welcome Section */}
     <div className="relative overflow-hidden rounded-3xl mb-3">
       {/* Gradient Background */}
       <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 opacity-90"></div>

       {/* Content Container */}
       <div className="relative z-10 p-4">
         {isFetching ? (
           <div className="space-y-3">
             <div className="h-8 sm:h-10 w-48 sm:w-64 rounded-xl bg-white/30 animate-pulse" />
             <div className="h-4 w-64 sm:w-80 rounded-xl bg-white/30 animate-pulse" />
           </div>
         ) : (
           <div className="max-w-2xl">
             {/* Welcome Text */}
             <div className="mb-1">
               <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-xl font-bold text-white inline-flex items-center">
                 Welcome to {user?.agency?.name}
               </h1>
             </div>

             <div className="mb-3">
               <p className="text-xl sm:text-lg md:text-xl lg:text-xl text-white/90 inline-flex items-center">
                 Your trusted partner in buying and selling property.
               </p>
             </div>

             {/* Stats Preview */}
             {userStats && userStats.length > 0 && (
               <div className="flex flex-wrap gap-3 sm:gap-4">
                 <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-xl">
                   <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                   <span className="text-white text-xs sm:text-sm font-medium">
                     {userStats[0]?.value || 0} {userStats[0]?.title}
                   </span>
                 </div>
                 {userStats[1] && (
                   <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-xl">
                     <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                     <span className="text-white text-xs sm:text-sm font-medium">
                       {userStats[1]?.value || 0} {userStats[1]?.title}
                     </span>
                   </div>
                 )}
               </div>
             )}
           </div>
         )}
       </div>
     </div>

     {/* Stats Section */}
     <div
       className={`mb-3 transition-all duration-500 ${
         isFetching ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
       }`}
     >
       {isFetching ? (
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
           {Array.from({ length: 3 }).map((_, index) => (
             <div
               key={index}
               className="h-24 rounded-2xl bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse"
             />
           ))}
         </div>
       ) : (
         <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-4 gap-3">
           {userStats.map((stat, index) => (
             <Link
               href={stat.href}
               key={index}
               className="bg-white rounded-xl shadow-lg p-3 md:p-6 hover:shadow-xl transition-all duration-300 border border-gray-100"
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
           <div className="h-64 rounded-2xl bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
           <div className="h-64 rounded-2xl bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
         </div>
       ) : (
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
           {/* Recent Activity */}
           <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
             <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
               <div className="flex items-center justify-between">
                 <h2 className="text-xl font-bold text-white">
                   Recent Activity
                 </h2>
                 {/* <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div> */}
               </div>
               <p className="text-blue-100 text-sm mt-1">
                 Stay updated with your latest activities
               </p>
             </div>
             <div className="p-3 bg-gradient-to-b from-blue-50/30 to-white">
               <div className="space-y-1">
                 {dashboardData?.recentActivity &&
                 dashboardData.recentActivity.length > 0 ? (
                   dashboardData.recentActivity.map((activity) => (
                     <Link
                       href={"/customer/notifications"}
                       key={activity?._id}
                       className="flex items-center space-x-3 p-3 rounded-xl bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 border border-gray-100 hover:border-blue-300 hover:shadow-md"
                     >
                       <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
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
                   <div className="flex flex-col items-center justify-center py-8 bg-white rounded-xl border-2 border-dashed border-blue-200">
                     <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-3 shadow-lg">
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
             <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 px-6 py-4">
               <div className="flex items-center justify-between">
                 <h2 className="text-xl font-bold text-white">
                   {user?.showAllProperty
                     ? "Latest Properties"
                     : "Shared Properties"}
                 </h2>
                 {dashboardData?.latestSharedProperties &&
                   dashboardData.latestSharedProperties.length > 0 && (
                     <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                       <span className="text-white text-sm font-semibold">
                         {dashboardData.latestSharedProperties.length} active
                       </span>
                     </div>
                   )}
               </div>
               <p className="text-orange-100 text-sm mt-1">
                 Highly engaged prospects
               </p>
             </div>
             <div className="p-3 bg-gradient-to-b from-orange-50/30 to-white">
               <div className="space-y-1">
                 {dashboardData?.latestSharedProperties &&
                 dashboardData.latestSharedProperties.length > 0 ? (
                   dashboardData.latestSharedProperties.map((property) => (
                     <Link
                       href={`/customer/properties/${property?.propertyId?._id}`}
                       key={property.propertyId?._id}
                       className="flex items-center space-x-4 p-3 bg-white border-l-4 border-orange-500 rounded-xl hover:shadow-lg hover:border-orange-600 transition-all duration-300 group shadow-sm"
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
                         {/* <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                           <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                         </div> */}
                       </div>

                       <div className="flex-1 min-w-0">
                         <h3 className="font-bold text-gray-800 group-hover:text-orange-600 transition-colors truncate">
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
                             <p className="text-base font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mt-1">
                               {formatPrice(property.propertyId?.price)}
                             </p>
                           )}
                       </div>
                     </Link>
                   ))
                 ) : (
                   <div className="flex flex-col items-center justify-center py-8 bg-white rounded-xl border-2 border-dashed border-orange-200">
                     <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center mb-3 shadow-lg">
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
             <div className="h-8 w-48 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
           </div>
         ) : (
           <div className="flex items-center justify-between mb-3">
             <div>
               <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                 Quick Actions
               </h2>
               <p className="text-gray-500 text-sm mt-1">
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
               className="h-40 rounded-2xl bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse"
             />
           ))}
         </div>
       ) : (
         <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
           {quickActions.map((action) => (
             <Link
               href={action.href}
               key={action.title}
               className="group relative overflow-hidden bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:border-blue-300"
             >
               <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
               <div className="relative flex flex-col items-center text-center">
                 <div
                   className={`p-4 rounded-xl mb-4 ${action.color
                     .replace("text", "bg")
                     .replace(
                       "-600",
                       "-100"
                     )} group-hover:scale-110 transition-transform duration-300 shadow-md`}
                 >
                   <action.icon className={`h-6 w-6 ${action.color}`} />
                 </div>
                 <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
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
