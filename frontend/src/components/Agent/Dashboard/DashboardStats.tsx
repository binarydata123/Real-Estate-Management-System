"use client";

import React from "react";
import {
  BuildingOfficeIcon,
  UsersIcon,
  CalendarIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
  trend?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  trend,
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-1 px-1 md:p-4 hover:shadow-md transition-shadow w-full max-w-xs mx-auto">
    <div className="flex-row items-center justify-between gap-1">
      {/* Left Section */}
      <div className="flex flex-col flex-1 items-center">
        <p className="text-[11px] md:text-sm font-medium text-gray-600">
          {title}
        </p>
        {trend && (
          <p className={`text-[10px] md:text-xs mt-0.5 font-semibold ${color}`}>
            {trend}
          </p>
        )}
      </div>

      {/* Icon */}
      <div className="flex-shrink-0">
        <div
          className={`p-1 md:p-3 rounded-lg flex items-start justify-between `}
        >
          <Icon className={`h-4 w-4 md:h-5 md:w-5 ${color}`} />
          <p className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
            {value}
          </p>
        </div>
      </div>
    </div>

    {/* Value */}
  </div>
);

export const DashboardStats: React.FC = () => {
  const stats = [
    {
      title: "Active",
      value: "12",
      icon: BuildingOfficeIcon,
      color: "text-blue-600",
      // trend: '+2 this week',
    },
    {
      title: "Customers",
      value: "34",
      icon: UsersIcon,
      color: "text-green-600",
      // trend: '+5 this month',
    },
    {
      title: "Meetings",
      value: "8",
      icon: CalendarIcon,
      color: "text-purple-600",
      // trend: '3 today',
    },
    {
      title: "Revenue",
      value: "₹2.4M",
      icon: CurrencyDollarIcon,
      color: "text-emerald-600",
      // trend: '+12% vs last month',
    },
  ];

  return (
    <div className="grid grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6 mb-2 md:mb-8">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default DashboardStats;
