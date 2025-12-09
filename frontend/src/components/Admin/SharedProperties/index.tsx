"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Building2 } from "lucide-react";
import { getSharedProperties, deleteSharedPropertiesById } from "@/lib/Admin/SharedPropertyAPI";
import ScrollPagination from "@/components/Common/ScrollPagination";
import ConfirmDialog from "@/components/Common/ConfirmDialogBox";
import SearchInput from "@/components/Common/SearchInput";
import { useSearchParams } from "next/navigation";
import { showErrorToast } from "@/utils/toastHandler";
import Link from "next/link";
import { formatDate } from "@/utils/dateFunction/dateFormate";

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
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const searchParams = useSearchParams(); // ✅ to access query string params
  const agencyId = searchParams.get("agencyId"); // ✅ extract agencyId from URL
  const [totalRecords, setTotalRecords] = useState(1);

  const sharedPropertyStats = [
    {
      name: "Total Property Share",
      value: totalRecords,
      icon: Building2,
      color: "bg-blue-500",
    }
  ];

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

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
          setTotalRecords(res.stats?.totalCountForStats ?? 0);
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
      agencyId || ""
    );
  }, [getAllSharedProperties, debouncedSearchTerm, agencyId]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || isFetching) return;
    const finalAgencyId = agencyId || "";
    getAllSharedProperties(
      page,
      debouncedSearchTerm,
      finalAgencyId,
      true
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-2 sm:p-6 lg:p-8">
      <div className="sm:flex sm:items-center sm:justify-between sm:gap-4">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Property Share
          </h1>
          <p className=" text-sm text-gray-700 dark:text-gray-300">
            Manage all shared properties
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <dl className="grid grid-cols-2 gap-5 sm:grid-cols-2 lg:grid-cols-4 mt-2">
        {sharedPropertyStats.map((item) => (
          <div key={item.name} className="flex justify-between items-center rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300 p-2 border-t-4 border-blue-500 group">
            <div className="">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{item.name}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{item.value}</p>
            </div>
            <div className=" bg-blue-500 dark:bg-indigo-600 rounded-full p-3 shadow-lg group-hover:scale-110 transition-transform">
              <item.icon className="h-7 w-7 text-white" aria-hidden="true" />
            </div>
          </div>
        ))}
      </dl>

      {/* Search and Filter */}
      <div className="mt-3 sm:flex sm:items-center sm:gap-x-4">
        <div className="flex-1">
          <label htmlFor="search" className="sr-only">
            Search
          </label>
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            aria-hidden="true"
          />
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
                  <div className="overflow-x-auto overflow-y-visible shadow-xl rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 w-full">
                    <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                      {sharedProperties.length > 0 ? (
                        <>
                          <thead className="bg-blue-50 dark:bg-gray-800">
                            <tr>
                              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-blue-700 dark:text-indigo-300 sm:pl-6">Shared By</th>
                              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-blue-700 dark:text-indigo-300 sm:pl-6">Shared With</th>
                              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-blue-700 dark:text-indigo-300 sm:pl-6">Property</th>
                              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-blue-700 dark:text-indigo-300 sm:pl-6">Shared On</th>
                              <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-blue-700 dark:text-indigo-300">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                            {sharedProperties.map((sharedProperty) => (
                              <tr key={sharedProperty._id} className="hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors">
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                  <div className="flex items-center">
                                    <div className="ml-4">
                                      <div className="font-semibold text-blue-700 dark:text-white">
                                        <Link
                                          href={`/admin/agencies/${sharedProperty.userData?.agencyId}`}
                                        >
                                          {sharedProperty.userData?.name || "N/A"}
                                        </Link>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                  <div className="flex items-center">
                                    <div className="ml-4">
                                      <div className="font-medium text-gray-900 dark:text-white">{sharedProperty.customerData?.fullName || "N/A"}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                  <div className="flex items-center">
                                    <div className="ml-4">
                                      <div className="font-medium text-blue-700 dark:text-indigo-300">
                                        <Link
                                          href={`/admin/properties/${sharedProperty.propertyData?._id}`}
                                        >
                                          {sharedProperty.propertyData?.title || "N/A"}
                                        </Link>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                  <div className="flex items-center">
                                    <div className="ml-4">
                                      <div className="font-medium text-gray-900 dark:text-white">{formatDate(sharedProperty.createdAt)}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm flex gap-2">
                                  <button
                                    onClick={() => handleDeleteClick(sharedProperty)}
                                    className="inline-flex items-center text-xs px-2 py-1 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 hover:text-red-800 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                                    aria-label="Delete Shared Property"
                                    title="Delete Shared Property"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </>
                      ) : (
                        <tbody>
                          <tr>
                            <td colSpan={6} className="text-center py-16">
                              <div className="flex flex-col items-center justify-center">
                                <Building2 className="h-16 w-16 text-blue-400 dark:text-indigo-400 mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No shared property yet</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-6">Start building your shared property base</p>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      )}
                    </table>
                  </div>
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
    </div>
  );
}
