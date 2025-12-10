"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Building2, PlusIcon, Calendar } from "lucide-react";
import { getMeetings, deleteMeetingById } from "@/lib/Admin/MeetingAPI";
import ScrollPagination from "@/components/Common/ScrollPagination";
import ConfirmDialog from "@/components/Common/ConfirmDialogBox";
import SearchInput from "@/components/Common/SearchInput";
import { useSearchParams } from "next/navigation";
import { showErrorToast, showSuccessToast } from "@/utils/toastHandler";
// import PropertyView from "../Properties/PropertyView";
import Link from "next/link";
import CustomerDetailsPopup from "../Common/customerPopup";

const statusStyles: { [key: string]: string } = {
  scheduled:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-400",
  completed: "bg-pink-100 text-pink-800 dark:bg-pink-500/10 dark:text-pink-400",
  confirmed:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-400",
  rescheduled:
    "bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400",
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Meetings() {
  const [meetings, setMeetings] = useState<MeetingFormData[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [selectedMeeting, setSelectedMeeting] =
    useState<MeetingFormData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = "10";
  const [searchTerm, setSearchTerm] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [debouncedSearchStatus, setDebouncedSearchStatus] = useState("");
  const searchParams = useSearchParams();
  const agencyId = searchParams.get("agencyId");
  // const [totalRecords, setTotalRecords] = useState(0); // Filtered count
  const [totalMeetingCount, setTotalMeetingCount] = useState(0); // ✅ Unfiltered total
  const [scheduledMeetingCount, setScheduledMeetingCount] = useState(0);

  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerFormData | null>(null);
  const [selectedAgencyName, setSelectedAgencyName] = useState<string>("");
  const meetingStats = [
    {
      name: "Total Meetings",
      value: totalMeetingCount, // ✅ Shows unfiltered total from backend
      icon: Building2,
      color: "bg-blue-500",
    },
    {
      name: "Schedule",
      value: scheduledMeetingCount, // ✅ FIXED: Use backend count
      icon: Calendar,
      color: "bg-indigo-500",
    },
  ];

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setDebouncedSearchStatus(searchStatus);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm, searchStatus]);

  const handleDeleteClick = (meeting: MeetingFormData) => {
    setSelectedMeeting(meeting);
    setShowConfirmDialog(true);

  };

  const handleDelete = async (id: string) => {
    try {
      const response = await deleteMeetingById(id);
      if (response.data.success) {
        const deletedMeeting = meetings.find((m) => m._id === id);

        setMeetings((prev) => prev.filter((c) => c._id !== id));
        // setTotalRecords((prev) => prev - 1);
        setTotalMeetingCount((prev) => prev - 1); // ✅ Decrement total
        showSuccessToast("Meeting deleted successfully");

        // Decrement scheduled count if deleted meeting was scheduled/rescheduled
        if (
          deletedMeeting &&
          (deletedMeeting.status === "scheduled" ||
            deletedMeeting.status === "rescheduled")
        ) {
          setScheduledMeetingCount((prev) => prev - 1);
        }
      }
    } catch (error) {
      showErrorToast("Error:", error);
    }
  };

  const handleCustomerClick = (meeting: MeetingFormData) => {
    setSelectedCustomer(meeting.customerData);
    // setSelectedPropertyName(meeting.propertyData?.title || "N/A");
    setSelectedAgencyName(meeting.agencyData?.name || "N/A");
    setIsPopupOpen(true);
    document.body.style.overflow = "hidden";

  };

  const getAllMeetings = useCallback(
    async (
      page = 1,
      search = "",
      status = "",
      agencyIdParam = "",
      append = false
    ) => {
      try {
        setIsFetching(true);
        const res = await getMeetings(
          page,
          limit,
          search,
          status,
          agencyIdParam
        );
        if (res.success) {
          setMeetings((prev) => (append ? [...prev, ...res.data] : res.data));
          setCurrentPage(res.pagination?.page ?? 1);
          setTotalPages(res.pagination?.totalPages ?? 1);
          // setTotalRecords(res.pagination?.total ?? 0); // Filtered count
          setTotalMeetingCount(res.pagination?.totalUnfiltered ?? 0); // ✅ Unfiltered total from backend
          setScheduledMeetingCount(res.pagination?.scheduledCount ?? 0);
        }
      } catch (error) {
        showErrorToast("Error:", error);
      } finally {
        setIsFetching(false);
      }
    },
    []
  );

  useEffect(() => {
    setMeetings([]); // Clear meetings on filter change
    getAllMeetings(
      1,
      debouncedSearchTerm,
      debouncedSearchStatus,
      agencyId || ""
    );
  }, [getAllMeetings, debouncedSearchTerm, debouncedSearchStatus, agencyId]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || isFetching) return;
    const finalAgencyId = agencyId || "";
    getAllMeetings(
      page,
      debouncedSearchTerm,
      debouncedSearchStatus,
      finalAgencyId,
      true
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="sm:flex sm:items-center sm:justify-between sm:gap-4">
          <div className="sm:flex-auto">
            <h1 className="text-4xl font-extrabold text-blue-700 dark:text-indigo-300 tracking-tight drop-shadow">
              Meetings
            </h1>
            <p className="mt-1 text-base text-gray-700 dark:text-gray-300">
              A list of all the meetings in the system including their name,
              members, and status.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mt-2">
          <dl className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {meetingStats.map((item) => (
              <div
                key={item.name}
                className="flex justify-between items-center rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300 p-3 border-t-4 border-blue-500 group"
              >
                <div className="">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {item.name}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {item.value}
                  </p>
                </div>
                <div
                  className={`${item.color} rounded-full p-3 shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <item.icon
                    className="h-7 w-7 text-white"
                    aria-hidden="true"
                  />
                </div>
              </div>
            ))}
          </dl>
        </div>

        {/* Search and Filter */}
        <div className="mt-3 sm:flex sm:items-center sm:gap-x-4">
          <div className="flex-1">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              aria-label="Search meetings"
            />
          </div>
          <div className="mt-4 sm:mt-0 sm:w-auto">
            <select
              id="status"
              name="status"
              onChange={(e) => setSearchStatus(e.target.value)}
              className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              defaultValue="All Statuses"
            >
              <option value={""}>All Statuses</option>
              <option value={"scheduled"}>Scheduled</option>
              <option value={"completed"}>Completed</option>
              <option value={"cancelled"}>Cancelled</option>
              <option value={"rescheduled"}>ReScheduled</option>
              <option value={"confirmed"}>Confirmed</option>
            </select>
          </div>
        </div>

        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div
                id="table-listing-sec"
                className="overflow-x-auto shadow-sm md:rounded-lg"
              >
                {isFetching && meetings.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="loader border-t-4 border-b-4 border-blue-600 w-12 h-12 rounded-full mx-auto animate-spin mb-4"></div>
                    <p className="text-gray-600">Loading Meetings...</p>
                  </div>
                ) : (
                  <>
                    <table className="min-w-full divide-y divide-gray-300 ">
                      {meetings.length > 0 ? (
                        <>
                          <thead className="bg-gray-50  dark:bg-gray-800">
                            <tr>
                              <th
                                scope="col"
                                className="py-3.5 pl-4 pr-3 text-center text-sm font-semibold text-blue-700 dark:text-indigo-300 sm:pl-6"
                              >
                                Customer
                              </th>
                              <th
                                scope="col"
                                className="py-3.5 pl-4 pr-3 text-center text-sm font-semibold text-blue-700 sm:pl-6 dark:text-indigo-300"
                              >
                                Property Name
                              </th>
                              <th
                                scope="col"
                                className="px-3 py-3.5 text-center text-sm font-semibold text-blue-700 sm:pl-6  dark:text-indigo-300"
                              >
                                Agency Name
                              </th>
                              <th
                                scope="col"
                                className="px-3 py-3.5 text-center text-sm font-semibold text-blue-700 sm:pl-6  dark:text-indigo-300"
                              >
                                Date
                              </th>
                              <th
                                scope="col"
                                className="px-3 py-3.5 text-center text-sm font-semibold text-blue-700 sm:pl-6  dark:text-indigo-300"
                              >
                                Time
                              </th>
                              <th
                                scope="col"
                                className="px-3 py-3.5 text-center text-sm font-semibold text-blue-700 sm:pl-6  dark:text-indigo-300"
                              >
                                Status
                              </th>
                              <th
                                scope="col"
                                className="px-3 py-3.5 text-center text-sm font-semibold text-blue-700 dark:text-indigo-300"
                              >
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white dark:bg-gray-900 dark:divide-gray-700">
                            {meetings.map((meeting, index) => (
                              <tr key={index}>
                                <td className="whitespace-nowrap  py-4 pl-4 pr-3 text-sm sm:pl-6">
                                  <div className="flex items-center">
                                    <div className="ml-4">
                                      <div
                                        className="font-medium text-blue-900 dark:text-white
                                                     transition-all duration-200 cursor-pointer
                                                       hover:underline"
                                        onClick={() =>
                                          handleCustomerClick(meeting)
                                        }
                                      >
                                        {meeting.customerData?.fullName ||
                                          "N/A"}
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6 flex justify-center items-center">
                                  <div className="flex items-center">
                                    <div className="ml-4">
                                      {meeting.propertyData?._id ? (
                                        <Link
                                          href={`/admin/properties/${meeting.propertyData._id}`}
                                          className="font-medium text-blue-900 dark:text-white hover:underline hover:text-blue-600 cursor-pointer"
                                        >
                                          {meeting.propertyData.title || "N/A"}
                                        </Link>
                                      ) : (
                                        <span className="font-medium text-blue-900 dark:text-gray-400  hover:underline hover:text-blue-600 cursor-pointer">
                                          N/A
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                  <div className="flex items-center">
                                    <div className="ml-4">
                                      {meeting.agencyData?._id ? (
                                        <Link
                                          href={`/admin/agencies/${meeting.agencyData._id}`}
                                          className="font-medium text-blue-900 dark:text-white hover:underline hover:text-blue-600 cursor-pointer"
                                        >
                                          {meeting.agencyData.name || "N/A"}
                                        </Link>
                                      ) : (
                                        <span className="font-medium text-blue-900 dark:text-gray-400  hover:underline hover:text-blue-600 cursor-pointer">
                                          N/A
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                  <div className="flex items-center">
                                    <div className="ml-4">
                                      <div className="font-medium text-gray-900 dark:text-white">
                                        {meeting.date
                                          ? new Date(
                                            meeting.date
                                          ).toLocaleDateString("en-US", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                          })
                                          : "N/A"}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                  <div className="flex items-center">
                                    <div className="ml-4">
                                      <div className="font-medium text-gray-900 dark:text-white">
                                        {meeting.time || "N/A"}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                  <span
                                    className={classNames(
                                      statusStyles[meeting.status],
                                      "inline-flex capitalize items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                                    )}
                                  >
                                    {meeting.status
                                      .replace(/_/g, " ")
                                      .replace(/\b\w/g, (char) =>
                                        char.toUpperCase()
                                      )}
                                  </span>
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                  <span
                                    onClick={() => handleDeleteClick(meeting)}
                                    className="cursor-pointer text-red-600 p-1 rounded hover:text-red-700 text-sm font-medium"
                                  >
                                    Delete
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </>
                      ) : (
                        <tbody>
                          <tr>
                            <td colSpan={7} className="text-center py-12">
                              <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                  No meetings yet
                                </h3>
                                <p className="text-gray-500 mb-6">
                                  Start building your meeting base
                                </p>
                                {!debouncedSearchTerm && (
                                  <div className="flex justify-center mt-4">
                                    <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                      <PlusIcon className="h-5 w-5 mr-2" />
                                      Add Meeting
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      )}
                    </table>
                  </>
                )}
              </div>
            </div>
          </div>
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

        <ConfirmDialog
          open={showConfirmDialog}
          onCancel={() => setShowConfirmDialog(false)}
          onConfirm={() => {
            if (selectedMeeting?._id) {
              handleDelete(selectedMeeting._id);
            }
            setShowConfirmDialog(false);
            setSelectedMeeting(null);
          }}
          heading="Are you sure?"
          description="This meeting will be deleted, and this action cannot be undone."
          confirmText="Delete"
          cancelText="Back"
          confirmColor="bg-red-600 hover:bg-red-700"
        />
      </div>
      {/* Add the popup component */}
      <CustomerDetailsPopup
        isOpen={isPopupOpen}
        onClose={() => {
          setIsPopupOpen(false);
          document.body.style.overflow = "unset";
        }}
        customerData={selectedCustomer}
        // propertyName={selectedPropertyName}
        agencyName={selectedAgencyName}
      />
    </div>
  );
}
