"use client";

import React from "react";
import { CalendarIcon, ClockIcon, } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

interface Customer {
  fullName: string;
}

export interface Reminder {
  _id: string;
  propertyId: {title:string};
  customerId: Customer;
  time: string;
  type: "meeting" | "follow_up" | "call";
  priority: "high" | "medium" | "low";
}

interface TodaysRemindersProps {
  reminders: Reminder[];
}

const TodaysReminders: React.FC<TodaysRemindersProps> = ({ reminders }) => {
  const router = useRouter();
  return (
    <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200">
      <div className="md:p-6 p-2 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Today&apos;s Meetings
        </h2>
      </div>

      <div className="p-2 md:p-6">
        {reminders?.length > 0 ? (
          <div className="md:space-y-4 space-y-2">
            {reminders.map((reminder) => {
              const Icon =CalendarIcon;
              return (
                <div key={reminder._id} onClick={() => router.push("/agent/meetings")} className="cursor-pointer">
                  <div className="flex flex-col md:flex-row md:items-center justify-between bg-gradient-to-br from-white to-gray-50 rounded-xl p-2 md:p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="flex items-start md:items-center gap-3 w-full">
                      <div className="p-2 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>

                      <div className="flex-1">
                        {/* Title and Priority */}
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-gray-900 text-[13px] md:text-sm font-medium leading-snug">
                            {reminder.propertyId?.title || ""}
                          </p>
                          {/* <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] md:text-xs font-semibold capitalize shadow-sm ${
                              reminder.priority === "high"
                                ? "bg-red-100 text-red-700"
                                : reminder.priority === "medium"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {reminder.priority || "NA"}
                          </span> */}
                        </div>

                        {/* Customer and Time */}
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-[13px] md:text-sm font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-md hover:bg-gray-200 transition-colors">
                            {reminder.customerId?.fullName || "Unknown"}
                          </p>
                          <div className="flex items-center gap-1 text-gray-500">
                            <ClockIcon className="w-4 h-4 text-blue" />
                            <p className="text-[10px] md:text-xs font-medium mt-1">
                              {reminder.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No reminders for today</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodaysReminders;
