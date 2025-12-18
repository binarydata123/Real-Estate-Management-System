
"use client";
import React, { useEffect, useState } from "react";
import {
  PlusIcon,
  CalendarIcon,
  // CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { AddMeetingForm } from "./AddMeetingForm";
import {
  getMeetingsByAgency,
  updateMeetingStatus,
  deleteMeeting,
} from "@/lib/Agent/MeetingAPI";
import { useAuth } from "@/context/AuthContext";
import { EditMeetingForm } from "./EditMeetingForm";
import ConfirmDialog from "../../Common/ConfirmDialogBox";
import ScrollPagination from "../../Common/ScrollPagination";
import { NoData } from "../../Common/NoData";
import MeetingAssistant from "./MeetingAssistant";
import { AddMeetingSelectionModal } from "./AddMeetingSelectionModal";
import { showErrorToast, showSuccessToast } from "@/utils/toastHandler";
import { getCustomers } from "@/lib/Agent/CustomerAPI";
import { AddCustomerForm } from "./AddCustomerForm";

interface Meeting {
  _id: string;
  date: string;
  time: string;
  status: string;
  isPast?: boolean;
  propertyId?: {
    title: string;
  };
  customer?: {
    fullName: string;
    isDeleted?: boolean;
  };
}

export const Meetings: React.FC = () => {
  const [addMode, setAddMode] = useState<"manual" | "ai" | null>(null);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [showAddCustomersModal, setShowAddCustomerModal] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [meetingStatus, setMeetingStatus] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "cancelled">(
    "upcoming"
  );

  const fetchMeetings = async (page = 1, append = false) => {
    if (!user?.agency?._id) return;
    setIsFetching(true);
    try {
      const res = await getMeetingsByAgency(
        user?.agency?._id,
        activeTab,
        page,
        10
      );
      setMeetings((prev) =>
        append ? [...prev, ...res.data.data] : res.data.data
      );
      setTotalPages(Math.ceil(res.data.total / 10));
      setCurrentPage(page);
    } catch (error) {
      showErrorToast("Failed to fetch meetings:", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    setMeetings([]);
    setCurrentPage(1);
    fetchMeetings(1);
  }, [user?.agency?._id, activeTab]);

  const handleStatusChange = async (status: string) => {
    setShowConfirmDialog(false);
    if (meetingId) await updateMeetingStatus(meetingId, status);
    setCurrentPage(1);
    fetchMeetings(1);
    showSuccessToast("Meeting Cancelled Successfully!");
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && !isFetching) {
      fetchMeetings(page, true);
    }
  };

  const onEdit = (id: string, status?: string) => {
    setShowEditForm(true);
    setMeetingId(id);
    if (status) setMeetingStatus(status);
  };

  const onCancel = (id: string) => {
    setShowConfirmDialog(true);
    setMeetingId(id);
  };

  const handleSelectMode = (mode: "manual" | "ai") => {
    setAddMode(mode);
    setShowSelectionModal(false);
  };


  
const handleDeleteMeeting = async () => {
  setShowDeleteConfirmDialog(false);

  if (!meetingToDelete) return;

  try {
    await deleteMeeting(meetingToDelete);
    showSuccessToast("Meeting deleted successfully!");

    // Refresh the meetings list
    setMeetings([]);
    setCurrentPage(1);
    fetchMeetings(1);
  } catch (error) {
    showErrorToast("Failed to delete meeting");
    console.error("Delete error:", error);
  } finally {
    setMeetingToDelete(null);
  }
};


const onDelete = (id:string)=>{
  setShowDeleteConfirmDialog(true);
  setMeetingToDelete(id);
}

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
      case "past":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleScheduleMeetingBtn = async () => {
    if (user?._id) {
      const res = await getCustomers(user?._id);
      if (res.success) {
        if (res?.data?.length === 0) {
          setShowAddCustomerModal(true);
        } else {
          setShowSelectionModal(true);
        }
      }
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
          onClick={handleScheduleMeetingBtn}
          className="flex items-center md:px-4 px-2 py-2 bg-primary text-white rounded-lg hover:bg-primary transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Schedule Meeting
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto scrollbar-hide">
        <nav className="flex space-x-4" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-3 py-2 font-medium text-sm rounded-t-md whitespace-nowrap ${
              activeTab === "upcoming"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Upcoming Meetings
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`px-3 py-2 font-medium text-sm rounded-t-md whitespace-nowrap ${
              activeTab === "past"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Past Meetings
          </button>
          <button
            onClick={() => setActiveTab("cancelled")}
            className={`px-3 py-2 font-medium text-sm rounded-t-md whitespace-nowrap ${
              activeTab === "cancelled"
                ? "text-primary border-b-2 border-primary"
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
          <div className="loader border-t-4 border-b-4 border-primary w-12 h-12 rounded-full mx-auto animate-spin mb-4"></div>
          <p className="text-gray-600">Loading meetings...</p>
        </div>
      ) : meetings.length > 0 ? (
        <div className="md:space-y-4 space-y-2">
          {meetings.map((meeting, index) => (
            <div
              key={index}
              className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200 p-2 md:p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row items-start justify-between">
                {/* Left: meeting info */}
                <div className="flex-1 w-full md:w-auto">
                  <div className="flex items-center space-x-3 md:mb-3 mb-2 w-full md:w-auto">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <CalendarIcon className="h-5 w-5 text-primary" />
                    </div>

                    <div className="w-full md:w-auto">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Meeting with {meeting?.customer?.fullName}
                      </h3>
                    </div>
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-2 md:grid-cols-2 gap-2 md:gap-4 text-sm md:mb-4">
                    <div>
                      <p className="text-gray-600 mb-1">Date & Time </p>
                      <div className="flex gap-1">
                        <div className="flex items-center text-gray-900 mb-1">
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
                        {meeting.propertyId
                          ? meeting.propertyId?.title
                          : "No property info"}
                      </p>
                    </div>
                  </div>

                  {/* Status + Actions row below details */}
                  <div className="flex flex-row justify-between items-center w-full">
                    {/* Status badge */}
                    <div className="flex flex-row justify-between items-center w-full">
                      <div>
                        {meeting.status && !meeting.isPast && (
                          <span
                            className={`inline-flex items-center px-2 md:px-3 py-1 capitalize rounded-lg md:rounded-xl text-xs font-medium ${getStatusColor(
                              meeting.status
                            )}`}
                          >
                            {meeting.status}
                          </span>
                        )}

                        {activeTab === "past" && (
                          <div className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded">
                            Completed
                          </div>
                        )}
                      </div>

                      {/* {activeTab === "past" && (
                        <button
                          onClick={() => {
                            onDelete(meeting._id);
                          }}
                          className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium rounded transition-colors"
                          title="Delete meeting"
                        >
                          Delete
                        </button>
                      )} */}

                      {activeTab === "past" && (
                        <button  onClick={()=> {onDelete(meeting._id)}} 
                        className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium rounded transition-colors"
                        title="Delete meeting"
                        
                        >Delete</button>
                      )}
                    </div>
                    {/* Action buttons */}
                    <div className="flex flex-row gap-2">
                      {/* Upcoming meetings - Edit & Cancel */}
                      {meeting.status !== "cancelled" && !meeting.isPast && (
                        <>
                          <button
                            onClick={() => onEdit(meeting._id)}
                            className="text-primary hover:text-primary text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onCancel(meeting._id)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {/* Cancelled meetings - Reschedule option */}
                      {meeting.status === "cancelled" &&
                        activeTab === "cancelled" && (
                          <button
                            onClick={() => {
                              onEdit(meeting._id, "rescheduled");
                            }}
                            className="text-sm text-blue-800 font-medium"
                          >
                            Reschedule
                          </button>
                        )}
                    </div>
                  </div>
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
                ? "Plan ahead by scheduling new meetings with your customers."
                : activeTab === "past"
                ? "Once meetings are completed, they'll show up here for your records."
                : "Cancelled meetings will be listed here if any were called off."
            }
            buttonIcon={
              activeTab === "upcoming" ? (
                <PlusIcon className="h-5 w-5 mr-2" />
              ) : undefined
            }
            onButtonClick={
              activeTab === "upcoming"
                ? () => setShowSelectionModal(true)
                : undefined
            }
          />
        )
      )}

      {/* Modals */}
      {addMode === "manual" && (
        <AddMeetingForm
          onClose={() => setAddMode(null)}
          onSuccess={() => {
            setAddMode(null);
            fetchMeetings(currentPage);
          }}
        />
      )}

      {showAddCustomersModal && (
        <AddCustomerForm onClose={() => setShowAddCustomerModal(false)} />
      )}

      <AddMeetingSelectionModal
        isOpen={showSelectionModal}
        onClose={() => setShowSelectionModal(false)}
        onSelectMode={handleSelectMode}
      />

      {addMode === "ai" && (
        <MeetingAssistant
          onClose={() => setAddMode(null)}
          onSuccess={() => {
            setAddMode(null);
            fetchMeetings(1);
          }}
        />
      )}

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


      {/* Confirm Dialog for Cancelling Meeting */}
      <ConfirmDialog
        open={showConfirmDialog}
        onCancel={() => setShowConfirmDialog(false)}
        onConfirm={() => handleStatusChange("cancelled")}
        heading="Are you sure?"
        description="Cancelling this meeting is permanent and cannot be reversed. Please confirm your action."
        confirmText="Cancel meeting"
        cancelText="Back"
        confirmColor="bg-red-600 hover:bg-red-700"
      />

      {/* Confirm Dialog for Deleting Meeting */}
      <ConfirmDialog
        open={showDeleteConfirmDialog}
        onCancel={() => {
          setShowDeleteConfirmDialog(false);
          setMeetingToDelete(null);
        }}
        onConfirm={handleDeleteMeeting}
        heading="Delete Meeting?"
        description="Deleting this meeting is permanent and cannot be undone. All meeting data will be lost."
        confirmText="Delete Meeting"
        cancelText="Cancel"
        confirmColor="bg-red-600 hover:bg-red-700"
      />

      {meetings.length > 0 && (
        <ScrollPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          isLoading={isFetching}
          hasMore={currentPage < totalPages}
          loader={
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          }
          endMessage={
            <div className="text-center py-8 text-green-600 font-medium">
              🎉 All caught up!
            </div>
          }
        />
      )}
    </div>
  );
};
