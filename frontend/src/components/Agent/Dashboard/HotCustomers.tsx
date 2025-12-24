"use client";

import React from "react";
import { UserIcon, PhoneIcon, FireIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export interface Customer {
  _id: string;
  fullName: string;
  maximumBudget?: number;
  minimumBudget?: number;
  phoneNumber?: string;
}

export interface HotCustomersProps {
  customers: Customer[];
}

const HotCustomers: React.FC<HotCustomersProps> = ({ customers }) => {
  const router = useRouter();

  const formatBudgetRange = (min?: number, max?: number): string => {
    const formatValue = (value: number): string => {
      if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
      if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
      if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
      return `₹${value}`;
    };

    if (!min && !max) return "Budget not specified";
    if (!min && max) return `Up to ${formatValue(max)}`;
    if (min && !max) return `From ${formatValue(min)}`;

    return `${formatValue(min!)} - ${formatValue(max!)}`;
  };

  return (
    <div className="bg-gradient-to-br from-white via-orange-50 to-orange-100 rounded-xl shadow-lg border border-orange-200 overflow-hidden">
      {/* Header with enhanced design */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <FireIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Hot Customers</h2>
              <p className="text-white/90 text-xs">Highly engaged prospects</p>
            </div>
          </div>
          <div className="text-white text-sm font-medium bg-white/20 px-3 py-1 rounded-lg">
            {customers?.length || 0} active
          </div>
        </div>
      </div>

      <div className="p-4">
        {customers?.length > 0 ? (
          <div className="space-y-3">
            {customers.map((customer) => (
              <div
                key={customer._id}
                className="group relative bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-orange-100 shadow-sm hover:shadow-md hover:border-orange-300 transition-all duration-200 cursor-pointer"
                onClick={() => router.push("/agent/customers")}
              >
                {/* Heat indicator line */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-400 to-red-500 rounded-l-lg"></div>

                <div className="flex items-center justify-between ml-3">
                  <div className="flex items-center gap-3">
                    {/* Enhanced avatar */}
                    <div className="relative">
                      <div className="h-12 w-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center shadow-sm">
                        <UserIcon className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-gradient-to-br from-red-500 to-orange-500 rounded-full border-2 border-white shadow-sm"></div>
                    </div>

                    {/* Customer info with better typography */}
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">
                        {customer.fullName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-medium text-gray-700 bg-gradient-to-r from-orange-50 to-red-50 px-2 py-0.5 rounded-md">
                          {formatBudgetRange(
                            customer.minimumBudget,
                            customer.maximumBudget
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Phone button with enhanced design */}
                  {customer.phoneNumber && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.location.href = `tel:${customer.phoneNumber}`;
                      }}
                      className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <PhoneIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
            <div className="inline-flex p-3 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl mb-3">
              <FireIcon className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-700 mb-1">
              No Hot Customers
            </h3>
            <p className="text-gray-600 text-sm">
              Check back later for updates
            </p>
          </div>
        )}
      </div>

      {/* Subtle footer */}
      <div className="px-4 py-3 bg-gradient-to-r from-orange-50 to-red-50 border-t border-orange-200">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-1 text-sm text-gray-700">
            <FireIcon className="h-4 w-4 text-orange-500" />
            <span>Based on recent activity</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotCustomers;