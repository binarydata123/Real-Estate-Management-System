"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Building2 } from "lucide-react";
import { getSharedProperties, deleteSharedPropertiesById } from "@/lib/Admin/SharedPropertyAPI";
import ScrollPagination from "@/components/Common/ScrollPagination";
import ConfirmDialog from "@/components/Common/ConfirmDialogBox";
import SearchInput from "@/components/Common/SearchInput";
import { useSearchParams } from "next/navigation";
import { showErrorToast } from "@/utils/toastHandler";
import PropertyFeedbackModal from "../SharedProperties/PropertyFeedbackModal";

const statusStyles: { [key: string]: string } = {
  viewed: "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-400",
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-400",
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function SharedProperties() {
  // State to control the Add Agency modal
  const [sharedProperties, setSharedProperties] = useState<SharePropertyFormData[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [selectedSharedProperty, setSelectedSharedProperty] = useState<SharePropertyFormData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = "10";
  const [searchTerm, setSearchTerm] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [debouncedSearchStatus, setDebouncedSearchStatus] = useState("");
  const searchParams = useSearchParams(); // ✅ to access query string params
  const agencyId = searchParams.get("agencyId"); // ✅ extract agencyId from URL
  const [totalRecords, setTotalRecords] = useState(1);
  const [viewPropertyFeedback, setViewPropertyFeedback] = useState<string>('');
  const [open, setOpen] = useState(false);

  // Calculate stats from mock data
  //const totalSharedProperties = sharedProperties.length;
  //const scheduleSharedProperties = sharedProperties.filter((a) => a.status === "scheduled").length;

  const sharedPropertyStats = [
    {
      name: "Total Property Share",
      value: totalRecords,
      icon: Building2,
      color: "bg-blue-500",
    },
    // {
    //   name: "Schedule",
    //   value: scheduleMeetings,
    //   icon: Calendar,
    //   color: "bg-indigo-500",
    // },
  ];

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setDebouncedSearchStatus(searchStatus);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm, searchStatus]);
  const handleDeleteClick = (sharedProperty: SharePropertyFormData) => {
    setSelectedSharedProperty(sharedProperty);
    setShowConfirmDialog(true);
  };
  const handleDelete = async (id: string) => {
    try {
      const response = await deleteSharedPropertiesById(id);
      if (response.data.success) {
        setSharedProperties((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (error) {
      showErrorToast("Error:", error);
    }
  };
  const getAllSharedProperties = useCallback(
    async (
      page = 1,
      search = "",
      status = "",
      agencyIdParam = "",
      append = false
    ) => {
      try {
        setIsFetching(true);
        const res = await getSharedProperties(
          page,
          limit,
          search,
          status,
          agencyIdParam
        );
        if (res.success) {
          setSharedProperties((prev) => (append ? [...prev, ...res.data] : res.data));
          setCurrentPage(res.pagination?.page ?? 1);
          setTotalPages(res.pagination?.totalPages ?? 1);
          setTotalRecords(res.pagination?.total ?? 0);
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
    setSharedProperties([]); // Clear meetings on filter change
    getAllSharedProperties(
      1,
      debouncedSearchTerm,
      debouncedSearchStatus,
      agencyId || ""
    );
  }, [getAllSharedProperties, debouncedSearchTerm, debouncedSearchStatus, agencyId]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || isFetching) return;
    const finalAgencyId = agencyId || "";
    getAllSharedProperties(
      page,
      debouncedSearchTerm,
      debouncedSearchStatus,
      finalAgencyId,
      true
    );
  };

  const truncateWords = (text:string, wordLimit: number) => {
    if (!text) return "---";
    const words = text.split(" ");
    return words.length > wordLimit
      ? `${words.slice(0, wordLimit).join(" ")}...`
      : text;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="sm:flex sm:items-center sm:justify-between sm:gap-4">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Property Share
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            A list of all the Property Share in the system including their name,
            members, and status.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:flex-none">
          {/* <button
                        type="button"
                        onClick={() => setAddAgencyModalOpen(true)}
                        className="inline-flex items-center justify-center rounded-md   bg-blue-600 md:px-4 px-2 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
                    >
                        <PlusCircle className="-ml-1 mr-2 h-5 w-5" />
                        Add Agency
                    </button> */}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mt-8">
        <dl className="grid grid-cols-2 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {sharedPropertyStats.map((item) => (
            <div
              key={item.name}
              className="relative overflow-hidden rounded-lg bg-white shadow p-2"
            >
              <div className="p-5 stats-card-padding-sec">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={classNames(item.color, "rounded-lg p-3")}>
                      <item.icon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                  <div className="ml-2 w-0 flex-1">
                    <dt className="truncate text-sm header-tab-sec font-medium text-gray-500 dark:text-gray-400">
                      {item.name}
                    </dt>
                    <dd>
                      <div className="flex items-baseline">
                        <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                          {item.value}
                        </p>
                      </div>
                    </dd>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </dl>
      </div>

      {/* Search and Filter */}
      <div className="mt-8 sm:flex sm:items-center sm:gap-x-4">
        <div className="flex-1">
          <label htmlFor="search" className="sr-only">
            Search
          </label>
          {/* <div className="relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <SearchInput value={searchTerm} onChange={setSearchTerm} className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
          </div> */}
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            aria-hidden="true"
          />
        </div>
        <div className="mt-4 sm:mt-0 sm:w-auto">
          <label htmlFor="status" className="sr-only">
            Status
          </label>
          <select
            id="status"
            name="status"
            onChange={(e) => setSearchStatus(e.target.value)}
            className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            defaultValue="All Statuses"
          >
            <option value={""}>All Statuses</option>
            <option value={"scheduled"}>Pending</option>
            <option value={"viewed"}>Viewed</option>
          </select>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div
              id="table-listing-sec"
              className="overflow-hidden shadow-sm  md:rounded-lg"
            >
              {isFetching && sharedProperties.length === 0 ? (
                <div className="text-center py-12">
                  <div className="loader border-t-4 border-b-4 border-blue-600 w-12 h-12 rounded-full mx-auto animate-spin mb-4"></div>
                  <p className="text-gray-600">Loading Meetings...</p>
                </div>
              ) : (
                <>
                  <table className="min-w-full divide-y divide-gray-300 ">
                    {sharedProperties.length > 0 ? (
                      <>
                        <thead className="bg-gray-50  dark:bg-gray-800">
                          <tr>
                            <th
                              scope="col"
                              className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 dark:text-gray-300"
                            >
                              Shared By User
                            </th>
                            <th
                              scope="col"
                              className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 dark:text-gray-300"
                            >
                              Shared With Customer
                            </th>
                            <th
                              scope="col"
                              className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 dark:text-gray-300"
                            >
                              Property Name
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-300"
                            >
                              Agency Name
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-300"
                            >
                              Message
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-300"
                            >
                              Status
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-300"
                            >
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white dark:bg-gray-900 dark:divide-gray-700">
                          {sharedProperties.map((sharedProperty) => (
                            <tr key={sharedProperty._id}>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                <div className="flex items-center">
                                  <div className="ml-4">
                                    <div className="font-medium text-gray-900 dark:text-white">
                                      {sharedProperty.userData?.name || "N/A"}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                <div className="flex items-center">
                                  <div className="ml-4">
                                    <div className="font-medium text-gray-900 dark:text-white">
                                      {sharedProperty.customerData?.fullName || "N/A"}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                <div className="flex items-center">
                                  <div className="ml-4">
                                    <div className="font-medium text-gray-900 dark:text-white">
                                      {sharedProperty.propertyData?.title || "N/A"}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                <div className="flex items-center">
                                  <div className="ml-4">
                                    <div className="font-medium text-gray-900 dark:text-white">
                                      {sharedProperty.agencyData?.name || "N/A"}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                <div className="flex items-center">
                                  <div className="ml-4">
                                    <div className="font-medium text-gray-900 dark:text-white">
                                        {sharedProperty.message ? truncateWords(sharedProperty.message, 5) : '---'}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                <span
                                  className={classNames(
                                    statusStyles[sharedProperty.status],
                                    "inline-flex capitalize items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                                  )}
                                >
                                  {sharedProperty.status
                                    ? sharedProperty.status.charAt(0).toUpperCase() + sharedProperty.status.slice(1)
                                    : "---"}
                                </span>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                <span
                                  onClick={() => handleDeleteClick(sharedProperty)}
                                  className="cursor-pointer text-red-600 p-1 rounded hover:text-red-700 text-sm font-medium"
                                >
                                  Delete
                                </span>
                                <span
                                  onClick={() => {
                                      setViewPropertyFeedback(sharedProperty._id);
                                      setOpen(true);
                                  }}
                                  className="cursor-pointer text-blue-600 p-1 rounded hover:text-blue-700 text-sm font-medium"
                                >
                                  View
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </>
                    ) : (
                      <div className="text-center py-12">
                        {/* <UserIcon className="h-24 w-24 text-gray-400 mx-auto mb-4" /> */}
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No shared property yet
                        </h3>
                        <p className="text-gray-500 mb-6">
                          Start building your shared property base
                        </p>
                      </div>
                    )}
                  </table>
                </>
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
          </div>
        </div>
      </div>

      {/* Add Property Modal */}
      {/* <AddAgencyModal isOpen={isAddAgencyModalOpen} onClose={() => setAddAgencyModalOpen(false)} /> */}
      <ConfirmDialog
        open={showConfirmDialog}
        onCancel={() => setShowConfirmDialog(false)}
        onConfirm={() => {
          if (selectedSharedProperty?._id) {
            handleDelete(selectedSharedProperty._id);
          }
          setShowConfirmDialog(false);
          setSelectedSharedProperty(null);
        }}
        heading="Are you sure?"
        description="This shared property will be deleted, and this action cannot be undone."
        confirmText="Delete"
        cancelText="Back"
        confirmColor="bg-red-600 hover:bg-red-700"
      />
      <PropertyFeedbackModal
        open={open}
        onClose={() => setOpen(false)}
        propertyShareId={viewPropertyFeedback}
      />
    </div>
  );
}
