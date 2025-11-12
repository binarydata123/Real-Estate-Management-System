"use client";

import React from "react";
import { UserIcon, PhoneIcon, FireIcon } from "@heroicons/react/24/outline";

export interface Customer {
  _id: string;
  fullName: string;
  maximumBudget?: number;
  minimumBudget?: number;
}

export interface HotCustomersProps {
  customers: Customer[];
}

const HotCustomers: React.FC<HotCustomersProps> = ({ customers }) => {
  const formatBudgetRange = (min?: number, max?: number): string => {
const formatValue = (value: number): string => {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value}`; // ✅ final guaranteed return
};

    // Handle missing or invalid budgets
    if (!min && !max) return "Budget not specified";
    if (!min && max) return `Up to ${formatValue(max)}`;
    if (min && !max) return `From ${formatValue(min)}`;

    return `${formatValue(min!)} - ${formatValue(max!)}`;
  };

  return (
    <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200">
      <div className="md:p-6 p-2 border-b border-gray-200">
        <div className="flex items-center gap-1">
          <FireIcon className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-semibold text-gray-900">Hot Customers</h2>
        </div>
      </div>

      <div className="p-2 md:p-6">
        {customers?.length > 0 ? (
          <div className="space-y-2 md:space-y-4">
            {customers.map((customer) => (
              <div
                key={customer._id}
                className="flex md:flex-row md:items-center justify-between p-2 md:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{customer.fullName}</p>
                    <p className="text-sm text-gray-600">
                      {formatBudgetRange(customer.minimumBudget, customer.maximumBudget)}
                    </p>
                  </div>
                </div>

                <div className="flex items-stretch">
                  <div className="flex flex-col justify-between flex-1">
                    <div className="text-right flex items-start gap-1 justify-end">
                      <span className="md:mt-2 text-blue-600 hover:text-blue-700">
                        <PhoneIcon className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hot customers right now</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HotCustomers;
