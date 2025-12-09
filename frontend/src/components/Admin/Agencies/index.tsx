"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Building2 } from "lucide-react";
import AddAgencyModal from "./AddAgencyModal";
import { getAgencies, deleteAgencyById } from "@/lib/Admin/AgencyAPI";
import ScrollPagination from "@/components/Common/ScrollPagination";
//import { useAuth } from "@/context/AuthContext";
import ConfirmDialog from "@/components/Common/ConfirmDialogBox";
import SearchInput from "@/components/Common/SearchInput";
import { showErrorToast, showSuccessToast } from "@/utils/toastHandler";
import Link from "next/link";

export default function Agencies() {
  // State to control the Add Agency modal
  const [isAddAgencyModalOpen, setAddAgencyModalOpen] = useState(false);
  //const { user } = useAuth();
  const [agencies, setAgencies] = useState<AgencyFormData[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [selectedAgency, setSelectedAgency] = useState<AgencyFormData | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = "10";
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);

  const agencyStats = [
    {
      name: "Total Agencies",
      value: totalRecords,
      icon: Building2,
      color: "bg-blue-500",
    },
  ];

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const handleDeleteClick = (agency: AgencyFormData) => {
    setSelectedAgency(agency);
    setShowConfirmDialog(true);
  };
  const handleDelete = async (id: string) => {
    try {
      const response = await deleteAgencyById(id);
      if (response.data.success) {
        setAgencies((prev) => prev.filter((c) => c._id !== id));
        showSuccessToast("Agency deleted successfully");
      }
    } catch (error) {
      showErrorToast("Failed to delete customer:", error);
    }
  };

  const getAllAgencies = useCallback(
    async (page = 1, search = "", append = false) => {
      try {
        setIsFetching(true);
        const res = await getAgencies(page, limit, search);
        if (res.success) {
          setAgencies((prev) => (append ? [...prev, ...res.data] : res.data));
          setCurrentPage(res.pagination?.page ?? 1);
          setTotalPages(res.pagination?.totalPages ?? 1);
          setTotalRecords(res.stats?.totalAgencies ?? 0);
        }
      } catch (error) {
        showErrorToast("Failed to fetch agencies:", error);
      } finally {
        setIsFetching(false);
      }
    },
    []
  );

  useEffect(() => {
    setAgencies([]); // Clear agencies when search term changes
    getAllAgencies(1, debouncedSearchTerm);
  }, [getAllAgencies, debouncedSearchTerm]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && !isFetching) {
      getAllAgencies(page, debouncedSearchTerm, true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="sm:flex sm:items-center sm:justify-between sm:gap-4">
          <div className="sm:flex-auto">
            <h1 className="text-4xl font-extrabold text-blue-700 dark:text-indigo-300 tracking-tight drop-shadow ">
              Agencies
            </h1>
            <p className="mt-1 text-base text-gray-700 dark:text-gray-300">
              Manage all agencies and their members. Use the search to find
              agencies quickly.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mt-2">
          <dl className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {agencyStats.map((item) => (
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
                <div className=" bg-blue-500 dark:bg-indigo-600 rounded-full p-3 shadow-lg group-hover:scale-110 transition-transform">
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
              aria-label="Search agencies"
              // className="w-full max-w-md p-2 rounded-lg  focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-x-auto overflow-y-visible shadow-lg rounded-xl bg-white dark:bg-gray-900 w-full">
                {isFetching && agencies.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="loader border-t-4 border-b-4 border-blue-600 w-12 h-12 rounded-full mx-auto animate-spin mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-300">
                      Loading Agencies...
                    </p>
                  </div>
                ) : (
                  <>
                    <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                      {agencies.length > 0 ? (
                        <>
                          <thead className="bg-blue-50 dark:bg-gray-800">
                            <tr>
                              <th
                                scope="col"
                                className="py-3.5 pl-4 pr-3 text-center text-sm font-semibold text-blue-700 dark:text-indigo-300 sm:pl-6"
                              >
                                Agency
                              </th>
                              <th
                                scope="col"
                                className="py-3.5 pl-4 pr-3 text-center text-sm font-semibold text-blue-700 dark:text-indigo-300 sm:pl-6"
                              >
                                Owner Name
                              </th>
                              <th
                                scope="col"
                                className="px-3 py-3.5 text-center text-sm font-semibold text-blue-700 dark:text-indigo-300"
                              >
                                Team Members
                              </th>
                              <th
                                scope="col"
                                className="px-3 py-3.5 text-center text-sm font-semibold text-blue-700 dark:text-indigo-300"
                              >
                                Properties
                              </th>
                              <th
                                scope="col"
                                className="px-3 py-3.5 text-center text-sm font-semibold text-blue-700 dark:text-indigo-300"
                              >
                                Customers
                              </th>
                              <th
                                scope="col"
                                className="px-3 py-3.5 text-center text-sm font-semibold text-blue-700 dark:text-indigo-300"
                              >
                                Meetings
                              </th>
                              <th
                                scope="col"
                                className="px-3 py-3.5 text-center text-sm font-semibold text-blue-700 dark:text-indigo-300"
                              >
                                Shared Properties
                              </th>
                              <th
                                scope="col"
                                className="px-3 py-3.5 text-center text-sm font-semibold text-blue-700 dark:text-indigo-300"
                              >
                                Joined
                              </th>
                              <th
                                scope="col"
                                className="px-3 py-3.5 text-center text-sm font-semibold text-blue-700 dark:text-indigo-300"
                              >
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                            {agencies.map((agency) => (
                              <tr
                                key={agency._id}
                                className="hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
                              >
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                  <div className="flex items-center">
                                    <div className="ml-4">
                                      <div className="font-semibold text-gray-900 dark:text-white">
                                        {agency.name}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                  <div className="flex items-center">
                                    <div className="ml-4">
                                      <div className="font-medium text-gray-900 dark:text-white">
                                        {agency.users?.name}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-blue-700 dark:text-indigo-300 text-center font-semibold">
                                  {(agency.teamMembers?.length ?? 0) > 0 &&
                                  agency?._id ? (
                                    <Link
                                      href={`/admin/team-members?agencyId=${agency._id}`}
                                      className="hover:underline"
                                    >
                                      {agency.teamMembers?.length ?? 0}
                                    </Link>
                                  ) : (
                                    agency.teamMembers?.length ?? 0
                                  )}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-blue-700 dark:text-indigo-300 text-center font-semibold">
                                  {(agency.properties?.length ?? 0) > 0 &&
                                  agency?._id ? (
                                    <Link
                                      href={`/admin/properties?agencyId=${agency._id}`}
                                      className="hover:underline"
                                    >
                                      {agency.properties?.length ?? 0}
                                    </Link>
                                  ) : (
                                    agency.properties?.length ?? 0
                                  )}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-blue-700 dark:text-indigo-300 text-center font-semibold">
                                  {(agency.customers?.length ?? 0) > 0 &&
                                  agency._id ? (
                                    <Link
                                      href={`/admin/customers?agencyId=${agency._id}`}
                                      className="hover:underline"
                                    >
                                      {agency.customers?.length ?? 0}
                                    </Link>
                                  ) : (
                                    agency.customers?.length ?? 0
                                  )}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-blue-700 dark:text-indigo-300 text-center font-semibold">
                                  {(agency.meetings?.length ?? 0) > 0 &&
                                  agency?._id ? (
                                    <Link
                                      href={`/admin/meetings?agencyId=${agency._id}`}
                                      className="hover:underline"
                                    >
                                      {agency.meetings?.length ?? 0}
                                    </Link>
                                  ) : (
                                    agency.meetings?.length ?? 0
                                  )}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-blue-700 dark:text-indigo-300 text-center font-semibold">
                                  {(agency.propertyshares?.length ?? 0) > 0 &&
                                  agency?._id ? (
                                    <Link
                                      href={`/admin/shared-properties?agencyId=${agency._id}`}
                                      className="hover:underline"
                                    >
                                      {agency.propertyshares?.length ?? 0}
                                    </Link>
                                  ) : (
                                    agency.propertyshares?.length ?? 0
                                  )}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center dark:text-gray-400">
                                  {new Date(
                                    agency.createdAt
                                  ).toLocaleDateString()}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm flex gap-2">
                                  <button
                                    onClick={() => handleDeleteClick(agency)}
                                    className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 font-medium rounded hover:bg-red-100 hover:text-red-800 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                                    aria-label="Delete Agency"
                                    title="Delete Agency"
                                  >
                                    Delete
                                  </button>
                                  <Link
                                    href={`/admin/agencies/${agency._id}`}
                                    legacyBehavior
                                  >
                                    <a
                                      className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 font-medium rounded hover:bg-blue-100 hover:text-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                                      aria-label="View Agency"
                                      title="View Agency"
                                    >
                                      View
                                    </a>
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </>
                      ) : (
                        <tbody>
                          <tr>
                            <td colSpan={9} className="text-center py-16">
                              <div className="flex flex-col items-center justify-center">
                                <Building2 className="h-16 w-16 text-blue-300 mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                  No agencies yet
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-6">
                                  Start building your agency base by adding a
                                  new agency.
                                </p>
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
          {agencies.length > 0 && (
            <div className="w-full flex justify-center items-center py-4 md:py-6">
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
          )}
        </div>

        {/* Add Agency Modal */}
        <AddAgencyModal
          isOpen={isAddAgencyModalOpen}
          onClose={() => setAddAgencyModalOpen(false)}
        />

        <ConfirmDialog
          open={showConfirmDialog}
          onCancel={() => setShowConfirmDialog(false)}
          onConfirm={() => {
            if (selectedAgency?._id) {
              handleDelete(selectedAgency._id);
            }
            setShowConfirmDialog(false);
            setSelectedAgency(null);
          }}
          heading="Are you sure?"
          description="This agency will be deleted, and this action cannot be undone."
          confirmText="Delete"
          cancelText="Back"
          confirmColor="bg-red-600 hover:bg-red-700"
        />
      </div>
    </div>
  );
}
