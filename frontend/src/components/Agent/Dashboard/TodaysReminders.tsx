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

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-[#0A2540] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/15 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Today&apos;s Meetings
              </h2>
              <p className="text-white/80 text-xs">Your schedule at a glance</p>
            </div>
          </div>
          <div className="text-white text-sm font-medium bg-white/15 px-3 py-1 rounded-lg">
            {reminders?.length || 0} scheduled
          </div>
        </div>
      </div>

      <div className="p-4">
        {reminders?.length > 0 ? (
          <div className="space-y-3">
            {reminders.map((reminder) => {
              return (
                <div
                  key={reminder._id}
                  className="group relative bg-[#F5F7FA] rounded-lg p-3 border border-gray-200 hover:shadow-md hover:border-[#C9A24D] transition-all duration-200 cursor-pointer"
                  onClick={() => router.push("/agent/meetings")}
                >
                  {/* Timeline indicator */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#C9A24D] rounded-l-lg"></div>

                  <div className="flex items-start justify-between ml-3">
                    <div className="flex items-center gap-3 flex-1">
                      {/* Time circle */}
                      <div className="relative mt-1">
                        <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200">
                          <ClockIcon className="h-5 w-5 text-[#0A2540]" />
                        </div>
                      </div>

                      {/* Meeting details */}
                      <div className="flex-1 items-center">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-[#0A2540] group-hover:text-[#C9A24D] transition-colors">
                              {reminder.propertyId?.title || ""}
                            </h3>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-sm font-medium text-gray-700 bg-white px-2 py-0.5 rounded-md border border-gray-200">
                                {reminder.customerId?.fullName || "Unknown"}
                              </span>
                            </div>
                          </div>

                          {/* Time badge */}
                          <div className="flex flex-col items-end">
                            <div className="px-2 py-1 bg-[#C9A24D] text-white text-sm font-semibold rounded-lg shadow-sm">
                              {reminder.time}
                            </div>
                            <span className="text-xs text-gray-600 mt-1 capitalize">
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
          <div className="text-center py-6 bg-[#F5F7FA] rounded-lg border border-gray-200">
            <div className="inline-flex p-3 bg-white rounded-xl mb-3 border border-gray-200">
              <CalendarIcon className="h-8 w-8 text-[#0A2540]" />
            </div>
            <h3 className="text-base font-semibold text-[#0A2540] mb-1">
              No Meetings Today
            </h3>
            <p className="text-gray-600 text-sm">Your schedule is clear</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-[#F5F7FA] border-t border-gray-200">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
          <ClockIcon className="h-4 w-4 text-[#0A2540]" />
          <span>Stay on schedule</span>
        </div>
      </div>
    </div>
  );
};

export default TodaysReminders;