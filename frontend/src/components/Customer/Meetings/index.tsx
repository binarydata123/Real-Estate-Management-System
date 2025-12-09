"use client";
import React, { useEffect, useState } from "react";
import { CalendarIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { NoData } from "../../Common/NoData";
import { getMeetingsByCustomer } from "@/lib/Customer/MeetingAPI";
import { showErrorToast } from "@/utils/toastHandler";
import ScrollPagination from "@/components/Common/ScrollPagination";

export const Meetings: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "cancelled">(
    "upcoming"
  );

  const fetchMeetings = async (page = 1, append = false) => {
    if (!user?._id) return;
    setIsFetching(true);
    try {
      const res = await getMeetingsByCustomer(user?._id, activeTab, page, 10); // 10 per page
      setMeetings((prev) =>
        append ? [...prev, ...res.data.data] : res.data.data
      );
      setTotalPages(Math.ceil(res.data.total / 10));
      setCurrentPage(page);
    } catch (error) {
      showErrorToast("Failed to fetch meetings", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    setMeetings([]); // Clear meetings when tab changes
    fetchMeetings(1);
  }, [user?._id, activeTab]); // `fetchMeetings` is not needed here as it's not wrapped in useCallback

  // page change handler
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || isFetching) return;
    fetchMeetings(page, true);
  };

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
          <p className="text-gray-600 md:mt-1">
            View and manage your scheduled appointments
          </p>
        </div>
      </div>
      <div className="border-b border-gray-200">
        <nav className="flex space-x-4" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-3 py-2 font-medium text-sm rounded-t-md ${
              activeTab === "upcoming"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Upcoming Meetings
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`px-3 py-2 font-medium text-sm rounded-t-md ${
              activeTab === "past"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Past Meetings
          </button>
          <button
            onClick={() => setActiveTab("cancelled")}
            className={`px-3 py-2 font-medium text-sm rounded-t-md ${
              activeTab === "cancelled"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Cancelled
          </button>
        </nav>
      </div>
      {/* Meetings List */}
      {isFetching && meetings.length === 0 ? (
        <div className="text-center py-12">
          <div className="loader border-t-4 border-b-4 border-blue-600 w-12 h-12 rounded-full mx-auto animate-spin mb-4"></div>
          <p className="text-gray-600">Loading meetings...</p>
        </div>
      ) : meetings.length > 0 ? (
        <div className="md:space-y-4 space-y-2">
          {meetings.map((meeting) => (
            <div
              key={meeting._id}
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
                        Meeting with {meeting?.agencyId?.name}
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
                          {meeting?.date &&
                            format(new Date(meeting.date), "MMM dd, yyyy")}
                          ,
                        </div>
                        <p className="font-medium text-gray-900">
                          {meeting?.time &&
                            format(
                              new Date(`1970-01-01T${meeting.time}:00`),
                              "hh:mm a"
                            )}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-gray-600 mb-1">Property</p>
                      <p className="font-medium text-gray-900 break-words">
                        {typeof meeting.property === "string"
                          ? meeting.property
                          : meeting.property?.title || "No property info"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right: status + actions */}
                <div className="flex md:flex-col flex-row justify-between items-end md:space-y-2 w-full md:w-auto">
                  {meeting.status && !meeting.isPast && (
                    <span
                      className={`inline-flex items-center px-2 md:px-3 py-1 capitalize rounded-lg md:rounded-xl  text-xs font-medium ${getStatusColor(
                        meeting.status
                      )}`}
                    >
                      {meeting.status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !isFetching && (
          <NoData
            icon={<CalendarIcon className="h-24 w-24 text-gray-400" />}
            heading={
              activeTab === "upcoming"
                ? "No meetings scheduled"
                : activeTab === "past"
                ? "No past meetings"
                : "No cancelled meetings"
            }
            description={
              activeTab === "upcoming"
                ? ""
                : activeTab === "past"
                ? "Once meetings are completed, they’ll show up here for your records."
                : "Cancelled meetings will be listed here if any were called off."
            }
          />
        )
      )}

      <ScrollPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        isLoading={isFetching}
        hasMore={currentPage < totalPages}
        loader={
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        }
        endMessage={
          
          <div className="text-center py-8 text-green-600 font-medium">
            🎉 All caught up!
          </div>

        }
      />
    </div>
  );
};
