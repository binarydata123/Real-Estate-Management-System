'use client';
import React, { useState, useEffect, useCallback } from "react";
import { Building2 } from "lucide-react";
import { getAgencies, deleteAgencyById } from "@/lib/Admin/AgencyAPI";
import ScrollPagination from "@/components/Common/ScrollPagination";
//import { useAuth } from "@/context/AuthContext";
import ConfirmDialog from "@/components/Common/ConfirmDialogBox";
import SearchInput from "@/components/Common/SearchInput";
import { showErrorToast, showSuccessToast } from "@/utils/toastHandler";
import Link from "next/link";

export default function Agencies() {
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

  // --- SKELETON COMPONENTS ---

  const StatsCardSkeleton = () => (
    <div className="flex justify-between items-center rounded-xl bg-white dark:bg-gray-800 shadow-lg p-3 border-t-4 border-gray-200 dark:border-gray-700 animate-pulse">
      <div className="">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2" />
        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-16" />
      </div>
      <div className="bg-gray-200 dark:bg-gray-700 rounded-full p-3 shadow-lg">
        <Building2 className="h-7 w-7 text-transparent" aria-hidden="true" />
      </div>
    </div>
  );

  const AgencyTableSkeleton = ({ rows = 5 }) => (
    <div className="overflow-x-auto shadow-lg rounded-xl bg-white dark:bg-gray-900 w-full animate-pulse">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-blue-50 dark:bg-gray-800">
          <tr>
            <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-blue-700 dark:text-indigo-300 sm:pl-6"><div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20" /></th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-blue-700 dark:text-indigo-300"><div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-24" /></th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-blue-700 dark:text-indigo-300"><div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20" /></th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-blue-700 dark:text-indigo-300"><div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20" /></th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-blue-700 dark:text-indigo-300"><div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20" /></th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-blue-700 dark:text-indigo-300"><div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20" /></th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-blue-700 dark:text-indigo-300"><div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20" /></th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-blue-700 dark:text-indigo-300"><div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16" /></th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-blue-700 dark:text-indigo-300">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
          {[...Array(rows)].map((_, i) => (
            <tr key={i} className="h-16">
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" /></td>
              <td className="whitespace-nowrap px-3 py-4 text-sm"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" /></td>
              <td className="whitespace-nowrap px-3 py-4 text-sm"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12" /></td>
              <td className="whitespace-nowrap px-3 py-4 text-sm"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12" /></td>
              <td className="whitespace-nowrap px-3 py-4 text-sm"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12" /></td>
              <td className="whitespace-nowrap px-3 py-4 text-sm"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12" /></td>
              <td className="whitespace-nowrap px-3 py-4 text-sm"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12" /></td>
              <td className="whitespace-nowrap px-3 py-4 text-sm"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" /></td>
              <td className="whitespace-nowrap px-3 py-4 text-sm flex gap-2"><div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-14" /><div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-14" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );


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
        <div className="mt-4">
          <dl className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {isFetching && agencies.length === 0 ? (
              // Show skeleton when initially loading
              agencyStats.map((item) => (
                <StatsCardSkeleton key={item.name} />
              ))
            ) : (
              agencyStats.map((item) => (
                <div key={item.name} className="flex justify-between items-center rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300 p-2 border-t-4 border-blue-500 group">
                  <div className="">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{item.name}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{item.value}</p>
                  </div>
                  <div className=" bg-blue-500 dark:bg-indigo-600 rounded-full p-3 shadow-lg group-hover:scale-110 transition-transform">
                    <item.icon className="h-7 w-7 text-white" aria-hidden="true" />
                  </div>
                </div>
              ))
            )}
          </dl>
        </div>

        {/* Search and Filter */}
        <div className="mt-4 sm:flex sm:items-center sm:gap-x-4">
          <div className="flex-1">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              aria-label="Search agencies"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              {isFetching && agencies.length === 0 ? (
                // Full table skeleton while initially loading
                <AgencyTableSkeleton rows={10} />
              ) : (
                <div className="overflow-x-auto overflow-y-visible shadow-xl rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 w-full">

                  <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                    {agencies.length > 0 ? (
                      <>
                        <thead className="bg-blue-50 dark:bg-gray-800">
                          <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-blue-700 dark:text-indigo-300 sm:pl-6">Agency</th>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-blue-700 dark:text-indigo-300 sm:pl-6">Agent Name</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-blue-700 dark:text-indigo-300">Members</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-blue-700 dark:text-indigo-300 hidden sm:table-cell">Properties</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-blue-700 dark:text-indigo-300 hidden md:table-cell">Customers</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-blue-700 dark:text-indigo-300 hidden lg:table-cell">Meetings</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-blue-700 dark:text-indigo-300 hidden xl:table-cell">Shared</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-blue-700 dark:text-indigo-300">Joined</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-blue-700 dark:text-indigo-300">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                          {agencies.map((agency,index) => (
                            <tr key={index} className="hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors">
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                <div className="flex items-center">
                                  <div className="ml-4">
                                    <div className="font-semibold text-gray-900 dark:text-white hover:underline">
                                      {agency._id ? (
                                        <Link href={`/admin/agencies/${agency._id}`} className="text-blue-700 dark:text-indigo-400 hover:text-blue-500 dark:hover:text-indigo-300">
                                        {agency.name}
                                      </Link>
                                      ): "N/A"}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                <div className="flex items-center">
                                  <div className="ml-4">
                                    <div className="font-medium text-gray-900 dark:text-white">{agency.users?.name}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-blue-700 dark:text-indigo-300 font-semibold">
                                {(agency.teamMembers?.length ?? 0) > 0 && agency?._id ? (
                                  <Link href={`/admin/team-members?agencyId=${agency._id}`} className="hover:underline">{agency.teamMembers?.length ?? 0}</Link>
                                ) : (
                                  agency.teamMembers?.length ?? 0
                                )}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-blue-700 dark:text-indigo-300 font-semibold hidden sm:table-cell">
                                {(agency.properties?.length ?? 0) > 0 && agency?._id ? (
                                  <Link href={`/admin/properties?agencyId=${agency._id}`} className="hover:underline">{agency.properties?.length ?? 0}</Link>
                                ) : (
                                  agency.properties?.length ?? 0
                                )}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-blue-700 dark:text-indigo-300 font-semibold hidden md:table-cell">
                                {(agency.customers?.length ?? 0) > 0 && agency._id ? (
                                  <Link href={`/admin/customers?agencyId=${agency._id}`} className="hover:underline">{agency.customers?.length ?? 0}</Link>
                                ) : (
                                  agency.customers?.length ?? 0
                                )}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-blue-700 dark:text-indigo-300 font-semibold hidden lg:table-cell">
                                {(agency.meetings?.length ?? 0) > 0 && agency?._id ? (
                                  <Link href={`/admin/meetings?agencyId=${agency._id}`} className="hover:underline">{agency.meetings?.length ?? 0}</Link>
                                ) : (
                                  agency.meetings?.length ?? 0
                                )}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-blue-700 dark:text-indigo-300 font-semibold hidden xl:table-cell">
                                {(agency.propertyshares?.length ?? 0) > 0 && agency?._id ? (
                                  <Link href={`/admin/shared-properties?agencyId=${agency._id}`} className="hover:underline">{agency.propertyshares?.length ?? 0}</Link>
                                ) : (
                                  agency.propertyshares?.length ?? 0
                                )}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                {new Date(agency.createdAt).toLocaleDateString()}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm flex gap-2">
                                <button
                                  onClick={() => handleDeleteClick(agency)}
                                  className="inline-flex items-center text-xs px-2 py-1 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 hover:text-red-800 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                                  aria-label="Delete Agency"
                                  title="Delete Agency"
                                >
                                  Delete
                                </button>
                                <Link href={`/admin/agencies/${agency._id}`}
                                  className="inline-flex items-center text-xs px-2 py-1 bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-100 hover:text-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                                  aria-label="View Agency"
                                  title="View Agency"
                                >
                                  View
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
                              <Building2 className="h-16 w-16 text-blue-400 dark:text-indigo-400 mb-4" />
                              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No agencies yet</h3>
                              <p className="text-gray-500 dark:text-gray-400 mb-6">Start building your agency base by adding a new agency.</p>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    )}
                  </table>
                </div>
              )}
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
              />
            </div>
          )}
        </div>


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