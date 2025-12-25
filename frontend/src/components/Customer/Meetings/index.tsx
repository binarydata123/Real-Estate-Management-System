"use client";
import React, { useEffect, useState } from "react";
import { CalendarIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { NoData } from "../../Common/NoData";
import {
  getMeetingsByCustomer,
  updateMeetingStatus,
} from "@/lib/Customer/MeetingAPI";
import { showErrorToast, showSuccessToast } from "@/utils/toastHandler";
import ScrollPagination from "@/components/Common/ScrollPagination";
import { EditMeetingForm } from "@/components/Agent/Meetings/EditMeetingForm";
import ConfirmDialog from "@/components/Common/ConfirmDialogBox";
// import { updateMeetingStatus } from "@/lib/Customer/MeetingAPI";
import SearchInput from "@/components/Common/SearchInput";



export const Meetings: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "cancelled">(
    "upcoming"
  );
  const [showEditForm,setShowEditForm] = useState(false);
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [meetingStatus,setMeetingStatus] = useState<string |null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [searchTerm,setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(()=>{
    const handler = setTimeout(()=>{
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    },400);
    return ()=> clearTimeout(handler);
   
  })

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

  const filteredMeetings = meetings.filter((meeting)=>{
    if(!debouncedSearchTerm) return true;

    const searchLower = debouncedSearchTerm.toLowerCase();
    const agencyName = meeting.agencyId?.name?.toLowerCase() || "";
    const propertyTitle = meeting.propertyId?.title?.toLowerCase() || "";
   const date = format(new Date(meeting.date), "PPP").toLowerCase();

    return (
      agencyName.includes(searchLower) ||
      propertyTitle.includes(searchLower) ||
      date.includes(searchLower)
    )
  })


  const onEdit = (id: string, status?: string) => {
    setMeetingId(id);
    if (status) setMeetingStatus(status);
    setShowEditForm(true);
  };


const onCancel = (id: string) => {
  setMeetingId(id);
  setShowConfirmDialog(true);
};

const handleStatusChange = async (status: string) => {
  if (!meetingId) return;

  try {
    await updateMeetingStatus(meetingId, { status });
    showSuccessToast("Meeting cancelled successfully");

    setShowConfirmDialog(false);
    setMeetingId(null);

    // ✅ FIX: Reset to page 1 and refetch
    setCurrentPage(1);
    setMeetings([]); // Clear current meetings
    fetchMeetings(1);
  } catch (error) {
    showErrorToast("Failed to update meeting status", error);
  }
};

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
  <div className="space-y-4 p-2 md:p-4">
    {/* Header Section */}
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 md:p-4 shadow-sm border border-blue-100">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
            Meetings
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            View and manage your scheduled appointments
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <SearchInput
            placeholder="Search by agency name, property, or date"
            value={searchTerm}
            onChange={setSearchTerm}
            className="flex-1 sm:w-64"
          />
        </div>
      </div>
    </div>

    {/* Tabs */}
    <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl overflow-x-auto scrollbar-hide">
      <nav className="flex space-x-6 px-4" aria-label="Tabs">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`px-1 py-4 font-semibold text-sm whitespace-nowrap border-b-2 transition-colors ${
            activeTab === "upcoming"
              ? "text-blue-600 border-blue-600"
              : "text-gray-600 border-transparent hover:text-gray-800 hover:border-gray-300"
          }`}
        >
          Upcoming Meetings
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={`px-1 py-4 font-semibold text-sm whitespace-nowrap border-b-2 transition-colors ${
            activeTab === "past"
              ? "text-blue-600 border-blue-600"
              : "text-gray-600 border-transparent hover:text-gray-800 hover:border-gray-300"
          }`}
        >
          Past Meetings
        </button>
        <button
          onClick={() => setActiveTab("cancelled")}
          className={`px-1 py-4 font-semibold text-sm whitespace-nowrap border-b-2 transition-colors ${
            activeTab === "cancelled"
              ? "text-blue-600 border-blue-600"
              : "text-gray-600 border-transparent hover:text-gray-800 hover:border-gray-300"
          }`}
        >
          Cancelled
        </button>
      </nav>
    </div>

    {/* Loading State */}
    {isFetching && meetings.length === 0 ? (
      <div className="grid grid-cols-1 gap-4 md:gap-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-[160px] md:h-[140px] w-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse rounded-xl"
          ></div>
        ))}
      </div>
    ) : meetings.length > 0 ? (
      <div className="space-y-4 md:space-y-5">
        {filteredMeetings.map((meeting) => (
          <div
            key={meeting._id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-300 overflow-hidden group"
          >
            <div className="p-3 md:p-5">
              {/* Top Section */}
              <div className="flex items-start justify-between gap-3 mb-3">
                {/* Left: Meeting Info */}
                <div className="flex items-start space-x-3 flex-1">
                  <div className="lg:h-12 lg:w-12 w-9 h-9 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300">
                    <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-6 md:w-6 lg:h-7 lg:w-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-base mb-1">
                      Meeting with {meeting?.agencyId?.name}
                    </h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900">
                          {meeting?.date &&
                            format(new Date(meeting.date), "MMM dd, yyyy")}
                          {meeting?.time &&
                            `, ${format(
                              new Date(`1970-01-01T${meeting.time}:00`),
                              "hh:mm a"
                            )}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Status Badge */}
                <div className="flex-shrink-0">
                  {activeTab === "past" && (
                    <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 text-xs font-semibold rounded-lg border border-green-200">
                      Completed
                    </span>
                  )}

                  {activeTab === "cancelled" && (
                    <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-red-50 to-rose-50 text-red-700 text-xs font-semibold rounded-lg border border-red-200">
                      Cancelled
                    </span>
                  )}

                  {activeTab === "upcoming" && meeting.status && (
                    <span
                      className={`inline-flex items-center px-3 py-1.5 capitalize rounded-lg text-xs font-semibold ${getStatusColor(
                        meeting.status
                      )}`}
                    >
                      {meeting.status}
                    </span>
                  )}
                </div>
              </div>

              {/* Property Info */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 px-2 py-1 rounded-lg border border-gray-200 shadow-sm mb-3">
                <p className="text-xs text-gray-500 font-medium tracking-wide mb-1">
                  Property
                </p>
                <p className="text-sm font-bold text-gray-900 break-words">
                  {typeof meeting.property === "string"
                    ? meeting.property
                    : meeting.property?.title || "No property info"}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                {/* Upcoming meetings - Edit & Cancel */}
                {activeTab === "upcoming" && meeting.status !== "cancelled" && (
                  <>
                    <button
                      onClick={() => onEdit(meeting._id)}
                      className="flex-1 sm:flex-none px-3 py-2 bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 hover:from-amber-100 hover:to-yellow-100 rounded-lg text-sm font-semibold transition-all duration-200 border border-amber-200 hover:border-amber-300 shadow-sm hover:shadow"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onCancel(meeting._id)}
                      className="flex-1 sm:flex-none px-3 py-2 bg-gradient-to-r from-red-50 to-rose-50 text-red-700 hover:from-red-100 hover:to-rose-100 rounded-lg text-sm font-semibold transition-all duration-200 border border-red-200 hover:border-red-300 shadow-sm hover:shadow"
                    >
                      Cancel
                    </button>
                  </>
                )}

                {/* Cancelled meetings - Reschedule button */}
                {activeTab === "cancelled" && (
                  <button
                    onClick={() => onEdit(meeting._id, "rescheduled")}
                    className="flex-1 sm:flex-none px-3 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 hover:from-blue-100 hover:to-cyan-100 rounded-lg text-sm font-semibold transition-all duration-200 border border-blue-200 hover:border-blue-300 shadow-sm hover:shadow"
                  >
                    Reschedule
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      !isFetching && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
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
                ? "Once meetings are completed, they'll show up here for your records."
                : "Cancelled meetings will be listed here if any were called off."
            }
          />
        </div>
      )
    )}

    {/* Edit Meeting Modal */}
    {showEditForm && (
      <EditMeetingForm
        meetingId={meetingId}
        meetingStatus={meetingStatus}
        onClose={() => setShowEditForm(false)}
        onSuccess={() => {
          setShowEditForm(false);
          fetchMeetings(currentPage);
        }}
      />
    )}

    {/* Cancel Confirmation Dialog */}
    <ConfirmDialog
      open={showConfirmDialog}
      onCancel={() => setShowConfirmDialog(false)}
      onConfirm={() => handleStatusChange("cancelled")}
      heading="Are you sure?"
      description="Cancelling this meeting is permanent and cannot be reversed."
      confirmText="Cancel meeting"
      cancelText="Back"
      confirmColor="bg-red-600 hover:bg-red-700"
    />

    {/* Pagination */}
    {filteredMeetings.length > 0 && (
      <ScrollPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        isLoading={isFetching}
        hasMore={currentPage < totalPages}
        loader={
          <div className="text-center py-6">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600"></div>
          </div>
        }
        endMessage={
          <div className="text-center py-8 text-green-600 font-semibold text-lg">
            🎉 All caught up!
          </div>
        }
      />
    )}
  </div>
);
};
