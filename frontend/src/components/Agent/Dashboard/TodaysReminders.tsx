"use client";

import React from "react";
import { CalendarIcon, ClockIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

interface Customer {
  fullName: string;
}

export interface Reminder {
  _id: string;
  propertyId: { title: string };
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "from-red-500 to-pink-500";
      case "medium":
        return "from-yellow-500 to-orange-500";
      default:
        return "from-green-500 to-emerald-500";
    }
  };
  return (
    <div className="bg-gradient-to-br from-white via-blue-50 to-cyan-100 rounded-xl shadow-lg border border-blue-200 overflow-hidden">
      {/* Enhanced header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Today&apos;s Meetings
              </h2>
              <p className="text-white/90 text-xs">Your schedule at a glance</p>
            </div>
          </div>
          <div className="text-white text-sm font-medium bg-white/20 px-3 py-1 rounded-lg">
            {reminders?.length || 0} scheduled
          </div>
        </div>
      </div>

      <div className="p-4">
        {reminders?.length > 0 ? (
          <div className="space-y-3">
            {reminders.map((reminder) => {
              const priorityColor = getPriorityColor(reminder.priority);
              // const priorityBg = getPriorityBg(reminder.priority);

              return (
                <div
                  key={reminder._id}
                  className="group relative bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-blue-100 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer"
                  onClick={() => router.push("/agent/meetings")}
                >
                  {/* Timeline indicator with priority color */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${priorityColor} rounded-l-lg`}
                  ></div>

                  <div className="flex items-start justify-between ml-3">
                    <div className="flex items-start gap-3 flex-1">
                      {/* Time circle */}
                      <div className="relative mt-1">
                        <div className="h-10 w-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center shadow-sm">
                          <ClockIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div
                          className={`absolute -bottom-1 -right-1 h-4 w-4 bg-gradient-to-br ${priorityColor} rounded-full border-2 border-white shadow-sm`}
                        ></div>
                      </div>

                      {/* Meeting details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                              {reminder.propertyId?.title || ""}
                            </h3>
                            <div className="flex items-center gap-2 mt-1.5">
                              {/* <span
                                className={`px-2 py-0.5 text-xs font-medium rounded-md ${priorityBg} border border-opacity-30 capitalize`}
                              > */}
                                {reminder.priority}
                              {/* </span> */}
                              <span className="text-sm font-medium text-gray-700 bg-gradient-to-r from-blue-50 to-cyan-50 px-2 py-0.5 rounded-md">
                                {reminder.customerId?.fullName || "Unknown"}
                              </span>
                            </div>
                          </div>

                          {/* Time badge */}
                          <div className="flex flex-col items-end">
                            <div className="px-2 py-1 bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-sm font-semibold rounded-lg shadow-sm">
                              {reminder.time}
                            </div>
                            <span className="text-xs text-gray-500 mt-1 capitalize">
                              {reminder.type}
                            </span>
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
          <div className="text-center py-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border border-gray-200">
            <div className="inline-flex p-3 bg-gradient-to-br from-blue-100 to-cyan-200 rounded-xl mb-3">
              <CalendarIcon className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-700 mb-1">
              No Meetings Today
            </h3>
            <p className="text-gray-600 text-sm">Your schedule is clear</p>
          </div>
        )}
      </div>

      {/* Subtle footer */}
      <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 border-t border-blue-200">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
          <ClockIcon className="h-4 w-4 text-blue-500" />
          <span>Stay on schedule</span>
        </div>
      </div>
    </div>
  );
};

export default TodaysReminders;  