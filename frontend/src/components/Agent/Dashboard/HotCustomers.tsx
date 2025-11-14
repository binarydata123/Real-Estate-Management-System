"use client";

import React from "react";
import { UserIcon, PhoneIcon, FireIcon } from "@heroicons/react/24/outline";

interface Customer {
  id: string;
  name: string;
  budget: string;
  lastActivity: string;
  status: string;
  temperature: "hot" | "warm" | "cold";
}

const HotCustomers = () => {
  const customers: Customer[] = [
    {
      id: "1",
      name: "Sarah Johnson",
      budget: "₹50L - ₹75L",
      lastActivity: "2 hours ago",
      status: "Negotiating",
      temperature: "hot",
    },
    {
      id: "2",
      name: "Michael Chen",
      budget: "₹1.2Cr - ₹1.5Cr",
      lastActivity: "5 hours ago",
      status: "Interested",
      temperature: "hot",
    },
    {
      id: "3",
      name: "David Wilson",
      budget: "₹80L - ₹1Cr",
      lastActivity: "1 day ago",
      status: "Contacted",
      temperature: "warm",
    },
  ];

  return (
    <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200">
      <div className="md:p-6 p-2 border-b border-gray-200">
        <div className="flex items-center gap-1 ">
          <FireIcon className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-semibold text-gray-900">Hot Customers</h2>
        </div>
      </div>
      <div className="p-2 md:p-6">
        {customers.length > 0 ? (
          <div className="space-y-2 md:space-y-4">
            {customers.map((customer) => (
              <div
                key={customer.id}
                className="flex md:flex-row md:items-center justify-between p-2 md:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{customer.name}</p>
                    <p className="text-sm text-gray-600">{customer.budget}</p>
                  </div>
                </div>
                <div className="flex items-stretch">
                  <div className="flex flex-col justify-between flex-1">
                    {/* top */}
                    <div className="text-right flex items-start gap-1 justify-end">
                      <p className="text-xs text-gray-500 capitalize md:mt-1">
                        {customer.status}
                      </p>
                      <span className="md:mt-2 text-blue-600 hover:text-blue-700">
                        <PhoneIcon className="h-4 w-4" />
                      </span>
                    </div>
                    {/* bottom */}
                    <p className="text-xs text-gray-500">
                      {customer.lastActivity}
                    </p>
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
