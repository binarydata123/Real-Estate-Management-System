"use client";
import React, { useEffect } from "react";
import { PlusIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { AddMeetingForm } from "./AddMeetingForm";
import { getAllMeetings } from "@/lib/Agent/MeetingAPI";

export const Meetings: React.FC = () => {
  const [showAddForm, setShowAddForm] = React.useState(false);

  // Mock meetings data
  const meetings = [
    {
      id: "1",
      customer: "Sarah Johnson",
      property: "Luxury 3BHK Apartment",
      scheduled_at: "2025-01-10T10:00:00Z",
      status: "scheduled",
    },
    {
      id: "2",
      customer: "Michael Chen",
      property: "Premium Commercial Office",
      scheduled_at: "2025-01-10T14:30:00Z",
      status: "scheduled",
    },
    {
      id: "3",
      customer: "David Wilson",
      property: "Spacious Villa",
      scheduled_at: "2025-01-08T16:00:00Z",
      status: "completed",
    },
  ];
  const fetchMeetings = async () => {
    const meetings = await getAllMeetings();
    console.log(meetings);
  };
  useEffect(() => {
    fetchMeetings();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "no_show":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meetings</h1>
          <p className="text-gray-600 md:mt-1">Manage customer meetings</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center md:px-4 px-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Schedule Meeting
        </button>
      </div>

      {/* Meetings List */}
      <div className="md:space-y-4 space-y-2">
        {meetings.map((meeting) => (
          <div
            key={meeting.id}
            className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200 p-2 md:p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col md:flex-row items-start justify-between">
              {/* Left: meeting info */}
              <div className="flex-1 w-full md:w-auto">
                <div className="flex items-center space-x-3 md:mb-3 mb-2 w-full md:w-auto">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CalendarIcon className="h-5 w-5 text-blue-600" />
                  </div>

                  <div className="w-full md:w-auto">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Meeting with {meeting.customer}
                    </h3>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 md:grid-cols-2 gap-2 md:gap-4 text-sm md:mb-4">
                  <div>
                    <p className="text-gray-600 mb-1">Date & Time </p>
                    <div className="flex gap-1">
                      <div className="flex items-center text-gray-900 mb-1">
                        {/* <ClockIcon className="h-4 w-4 mr-2" /> */}
                        {format(new Date(meeting.scheduled_at), "MMM dd, yyyy")}
                        ,
                      </div>
                      <p className="font-medium text-gray-900">
                        {format(new Date(meeting.scheduled_at), "hh:mm a")}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-600 mb-1">Property</p>
                    <p className="font-medium text-gray-900">
                      {meeting.property ?? "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: status + actions */}
              <div className="flex md:flex-col flex-row justify-between items-end md:space-y-2 w-full md:w-auto">
                <span
                  className={`inline-flex items-center px-2 md:px-3 py-1 capitalize rounded-lg md:rounded-xl  text-xs font-medium ${getStatusColor(
                    meeting.status
                  )}`}
                >
                  {meeting.status}
                </span>

                {meeting.status === "scheduled" && (
                  <div className="flex md:flex-col flex-row gap-2">
                    <button
                      // onClick={() => onJoin?.(meeting)}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      Join
                    </button>
                    <button
                      // onClick={() => onEdit?.(meeting)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      // onClick={() => onCancel?.(meeting)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {meetings.length === 0 && (
        <div className="text-center py-12">
          <CalendarIcon className="h-24 w-24 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No meetings scheduled
          </h3>
          <p className="text-gray-500 mb-6">
            Start scheduling meetings with your customers
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Schedule Your First Meeting
          </button>
        </div>
      )}

      {/* Add Meeting Modal */}
      {showAddForm && (
        <AddMeetingForm
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false);
            fetchMeetings();
            // Refresh meetings list
          }}
        />
      )}
    </div>
  );
};
