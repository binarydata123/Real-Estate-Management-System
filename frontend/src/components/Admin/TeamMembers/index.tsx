"use client";
import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Building2 } from "lucide-react";
import { getTeamMembers, deleteTeamMemberById } from "@/lib/Admin/TeamMemberAPI";
import ScrollPagination from "@/components/Common/ScrollPagination";
import ConfirmDialog from "@/components/Common/ConfirmDialogBox";
import SearchInput from "@/components/Common/SearchInput";
import { showErrorToast } from "@/utils/toastHandler";
import { useSearchParams, useRouter } from "next/navigation";

export default function TeamMembers() {
  const router = useRouter();
  // State to control the Add Agency modal
  const [teamMembers, setTeamMembers] = useState<TeamMemberFormData[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [selectedTeamMember, setSelectedTeamMember] = useState<TeamMemberFormData | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = "10";
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const totalTeamMembers = teamMembers.length;

  const searchParams = useSearchParams(); // ✅ to access query string params
  const agencyId = searchParams.get("agencyId"); // ✅ extract agencyId from URL

  const teamMembersStats = [
    {
      name: "Total Team Members",
      value: totalTeamMembers,
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

  const handleDeleteClick = (teamMember: TeamMemberFormData) => {
    setSelectedTeamMember(teamMember);
    setShowConfirmDialog(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await deleteTeamMemberById(id);
      if (response.data.success) {
        setTeamMembers((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (error) {
      showErrorToast("Failed to delete agent:", error);
    }
  };

  const getAllTeamMembers = useCallback(
    async (page = 1, search = "", agencyIdParam = "", append = false) => {
      try {
        setIsFetching(true);
        const res = await getTeamMembers(page, limit, search, status, agencyIdParam);
        if (res.success) {
          setTeamMembers((prev) => (append ? [...prev, ...res.data] : res.data));
          setCurrentPage(res.pagination?.page ?? 1);
          setTotalPages(res.pagination?.totalPages ?? 1);
          //setTotalRecords(res.pagination?.total ?? 0);
        }
      } catch (error) {
        showErrorToast("Failed to fetch team members:", error);
      } finally {
        setIsFetching(false);
      }
    },
    []
  );

  useEffect(() => {
    setTeamMembers([]); // Clear agents when search term changes
    getAllTeamMembers(1, debouncedSearchTerm, agencyId || "");
  }, [getAllTeamMembers, debouncedSearchTerm, agencyId]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && !isFetching) {
      const finalAgencyId = agencyId || "";
      getAllTeamMembers(page, debouncedSearchTerm, finalAgencyId, true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-2 sm:p-6 lg:p-8">
      <div className="sm:flex sm:items-center sm:justify-between sm:gap-4">
        <div className="sm:flex-auto">
          <div className="flex items-center gap-3">
            <div className="p-2 w-8 rounded-4xl bg-blue-500 text-white" onClick={() => router.back()}>
              <ArrowLeft />
            </div>
            <div>
              <h1 className="text-4xl text-blue-700 font-semibold  dark:text-white">
                Team Members
              </h1>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Manage agencies team members
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mt-3">
        <dl className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembersStats.map((item) => (
            <div
              key={item.name}
              className="flex justify-between items-center rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300 p-3 border-t-4 border-blue-500 group"
            >
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
      </div>

      {/* Search and Filter */}
      <div className="mt-8 sm:flex sm:items-center sm:gap-x-4">
        <div className="flex-1">
          <label htmlFor="search" className="sr-only">
            Search
          </label>
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            aria-label="Search team members"
          // className=" focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          />
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-x-auto overflow-y-visible shadow-lg rounded-xl bg-white dark:bg-gray-900 w-full">
              {isFetching && teamMembers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="loader border-t-4 border-b-4 border-blue-600 w-12 h-12 rounded-full mx-auto animate-spin mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-300">Loading Team Members...</p>
                </div>
              ) : (
                <>
                  <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                    {teamMembers.length > 0 ? (
                      <>
                        <thead className="bg-blue-50 dark:bg-gray-800">
                          <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-blue-700 dark:text-indigo-300 sm:pl-6"> Name</th>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-blue-700 dark:text-indigo-300 sm:pl-6">Agency Name</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-blue-700 dark:text-indigo-300">Email</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-blue-700 dark:text-indigo-300">Phone</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-blue-700 dark:text-indigo-300">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                          {teamMembers.map((teamMember) => (
                            <tr key={teamMember._id} className="hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors">
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                <div className="flex items-center">
                                  <div className="ml-4">
                                    <div className="font-semibold text-gray-900 dark:text-white">{teamMember.name || "N/A"}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 dark:text-white font-medium">
                                {teamMember?.agencyId?.name || "N/A"}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-blue-700 dark:text-indigo-300 font-semibold">
                                {teamMember?.email || "N/A"}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-blue-700 dark:text-indigo-300 font-semibold">
                                {teamMember.phone || "N/A"}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm flex gap-2">
                                <button
                                  onClick={() => handleDeleteClick(teamMember)}
                                  className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 font-medium rounded hover:bg-red-100 hover:text-red-800 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                                  aria-label="Delete Team Member"
                                  title="Delete Team Member"
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
                              <Building2 className="h-16 w-16 text-blue-300 mb-4" />
                              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No team members yet</h3>
                              <p className="text-gray-500 dark:text-gray-400 mb-6">Start building your team member base.</p>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    )}
                  </table>
                </>
              )}
              {/* Show pagination only if there are records */}
              {teamMembers.length > 0 && (
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
          </div>
        </div>
      </div>

      {/* Add Property Modal */}
      {/* <AddAgencyModal isOpen={isAddAgencyModalOpen} onClose={() => setAddAgencyModalOpen(false)} /> */}
      <ConfirmDialog
        open={showConfirmDialog}
        onCancel={() => setShowConfirmDialog(false)}
        onConfirm={() => {
          if (selectedTeamMember?._id) {
            handleDelete(selectedTeamMember._id);
          }
          setShowConfirmDialog(false);
          setSelectedTeamMember(null);
        }}
        heading="Are you sure?"
        description="This team member will be deleted, and this action cannot be undone."
        confirmText="Delete"
        cancelText="Back"
        confirmColor="bg-red-600 hover:bg-red-700"
      />
    </div >
  );
}
