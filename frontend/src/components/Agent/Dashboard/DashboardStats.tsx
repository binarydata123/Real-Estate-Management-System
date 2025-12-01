"use client";

import React from "react";
import {
  BuildingOfficeIcon,
  UsersIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  link: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
  link
}) => {
  const router = useRouter();
  return (
    <div onClick={() => router.push(link)} className="cursor-pointer bg-white rounded-xl shadow-sm border border-gray-200 p-2 hover:shadow-lg transition-shadow duration-300">
      <div className="flex flex-row-reverse justify-between">
        <div className="flex-shrink-0">
          <div className={`p-2 rounded-full ${bgColor}`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
        </div>
        <div className="">
          <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {value !== undefined && value !== null ? value : 0}
          </p>
        </div>
      </div>
    </div>
  )
}

interface DashboardStatsProps {
  value?: {
    totalProperties?: string | number;
    totalCustomers?: string | number;
    totalMeetings?: string | number;
  };
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ value }) => {
  const stats = [
    {
      title: "Properties",
      value: value?.totalProperties ?? 0,
      icon: BuildingOfficeIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      link: "/agent/properties"
    },
    {
      title: "Customers",
      value: value?.totalCustomers ?? 0,
      icon: UsersIcon,
      color: "text-green-600",
      bgColor: "bg-green-100",
      link: "/agent/customers"
    },
    {
      title: "Meetings",
      value: value?.totalMeetings ?? 0,
      icon: CalendarIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      link: "/agent/meetings"
    },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-2 md:mb-8">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default DashboardStats;
