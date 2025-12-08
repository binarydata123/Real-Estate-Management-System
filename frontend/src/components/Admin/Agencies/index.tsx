"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Building2 } from "lucide-react";
import AddAgencyModal from "./AddAgencyModal";
import { getAgencies, deleteAgencyById } from "@/lib/Admin/AgencyAPI";
import ScrollPagination from "@/components/Common/ScrollPagination";
//import { useAuth } from "@/context/AuthContext";
import ConfirmDialog from "@/components/Common/ConfirmDialogBox";
import SearchInput from "@/components/Common/SearchInput";
import { showErrorToast } from "@/utils/toastHandler";
//import AgencyModal from "./AgencyModal";
import Link from "next/link";

// const statusStyles: { [key: string]: string } = {
//   approved:
//     "bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400",
//   pending:
//     "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-400",
//   rejected: "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400",
// };

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

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
  const [searchStatus, setSearchStatus] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [debouncedSearchStatus, setDebouncedSearchStatus] = useState("");
  //const [open, setOpen] = useState(false);
  //const [viewAgency, setViewAgency] = useState<AgencyFormData | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);

  // Calculate stats from mock data
  //const totalAgencies = agencies.length;
  // const approvedAgencies = agencies.filter(
  //   (a) => a.status === "approved"
  // ).length;
  // const pendingAgencies = agencies.filter((a) => a.status === "pending").length;
  // const rejectedAgencies = agencies.filter(
  //   (a) => a.status === "rejected"
  // ).length;

  const agencyStats = [
    {
      name: "Total Agencies",
      value: totalRecords,
      icon: Building2,
      color: "bg-blue-500",
    },
    // {
    //   name: "Approved",
    //   value: approvedAgencies,
    //   icon: CheckCircle,
    //   color: "bg-green-500",
    // },
    // {
    //   name: "Pending",
    //   value: pendingAgencies,
    //   icon: Clock,
    //   color: "bg-yellow-500",
    // },
    // {
    //   name: "Rejected",
    //   value: rejectedAgencies,
    //   icon: XCircle,
    //   color: "bg-red-500",
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

  const handleDeleteClick = (agency: AgencyFormData) => {
    setSelectedAgency(agency);
    setShowConfirmDialog(true);
  };
  const handleDelete = async (id: string) => {
    try {
      const response = await deleteAgencyById(id);
      if (response.data.success) {
        setAgencies((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (error) {
      showErrorToast("Failed to delete customer:", error);
    }
  };

  const getAllAgencies = useCallback(
    async (page = 1, search = "", status = "", append = false) => {
      try {
        setIsFetching(true);
        const res = await getAgencies(page, limit, search, status);
        if (res.success) {
          setAgencies((prev) => (append ? [...prev, ...res.data] : res.data));
          setCurrentPage(res.pagination?.page ?? 1);
          setTotalPages(res.pagination?.totalPages ?? 1);
          setTotalRecords(res.pagination?.total ?? 0);
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
    getAllAgencies(1, debouncedSearchTerm, debouncedSearchStatus);
  }, [getAllAgencies, debouncedSearchTerm, debouncedSearchStatus]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && !isFetching) {
      getAllAgencies(page, debouncedSearchTerm, debouncedSearchStatus, true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="sm:flex sm:items-center sm:justify-between sm:gap-4">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Agencies
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            A list of all the agencies in the system including their name,
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
          {agencyStats.map((item) => (
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
            <option value={"approved"}>Approved</option>
            <option value={"pending"}>Pending</option>
            <option value={"rejected"}>Rejected</option>
          </select>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow-sm  md:rounded-lg">
              {isFetching && agencies.length === 0 ? (
                <div className="text-center py-12">
                  <div className="loader border-t-4 border-b-4 border-blue-600 w-12 h-12 rounded-full mx-auto animate-spin mb-4"></div>
                  <p className="text-gray-600">Loading Agency...</p>
                </div>
              ) : (
                <>
                  <table className="min-w-full divide-y divide-gray-300 ">
                    {agencies.length > 0 ? (
                      <>
                        <thead className="bg-gray-50  dark:bg-gray-800">
                          <tr>
                            <th
                              scope="col"
                              className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 dark:text-gray-300"
                            >
                              Agency
                            </th>
                            <th
                              scope="col"
                              className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 dark:text-gray-300"
                            >
                              Owner Name
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-300"
                            >
                              Team Members
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-300"
                            >
                              Properties
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-300"
                            >
                              Customers
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-300"
                            >
                              Meetings
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-300"
                            >
                              Shared Properties
                            </th>
                            {/* <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-300"
                            >
                              Status
                            </th> */}
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-300"
                            >
                              Joined
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
                          {agencies.map((agency) => (
                            <tr key={agency._id}>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                <div className="flex items-center">
                                  <div className="ml-4">
                                    <div className="font-medium text-gray-900 dark:text-white">
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
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                {(agency.teamMembers?.length ?? 0) > 0 &&
                                  agency?._id ? (
                                    <a
                                      className="text-blue-800"
                                      href={`/admin/team-members?agencyId=${agency._id}`}
                                    >
                                      {agency.teamMembers?.length ?? 0}
                                    </a>
                                  ) : (
                                    agency.teamMembers?.length ?? 0
                                )}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                {(agency.properties?.length ?? 0) > 0 &&
                                  agency?._id ? (
                                    <a
                                      className="text-blue-800"
                                      href={`/admin/properties?agencyId=${agency._id}`}
                                    >
                                      {agency.properties?.length ?? 0}
                                    </a>
                                  ) : (
                                    agency.properties?.length ?? 0
                                )}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                {(agency.customers?.length ?? 0) > 0 &&
                                  agency._id ? (
                                    <a
                                      className="text-blue-800"
                                      href={`/admin/customers?agencyId=${agency._id}`}
                                    >
                                      {agency.customers?.length ?? 0}
                                    </a>
                                  ) : (
                                    agency.customers?.length ?? 0
                                )}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                {(agency.meetings?.length ?? 0) > 0 &&
                                  agency?._id ? (
                                    <a
                                      className="text-blue-800"
                                      href={`/admin/meetings?agencyId=${agency._id}`}
                                    >
                                      {agency.meetings?.length ?? 0}
                                    </a>
                                  ) : (
                                    agency.meetings?.length ?? 0
                                )}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                {(agency.propertyshares?.length ?? 0) > 0 &&
                                  agency?._id ? (
                                    <a
                                      className="text-blue-800"
                                      href={`/admin/shared-properties?agencyId=${agency._id}`}
                                    >
                                      {agency.propertyshares?.length ?? 0}
                                    </a>
                                  ) : (
                                    agency.propertyshares?.length ?? 0
                                )}
                              </td>
                              {/* <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                <span
                                  className={classNames(
                                    statusStyles[agency.status],
                                    "inline-flex capitalize items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                                  )}
                                >
                                  {agency.status.charAt(0).toUpperCase() +
                                    agency.status.slice(1)}
                                </span>
                              </td> */}
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                {new Date(
                                  agency.createdAt
                                ).toLocaleDateString()}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                {/* <button className="text-gray-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400"><span className="sr-only">Actions for {agency.name}</span><MoreVertical className="h-5 w-5" /></button> */}
                                {/* <span
                                                                    //onClick={() => setEditingAgency(agency)}
                                                                    className="cursor-pointer text-yellow-600 p-1 rounded hover:text-yellow-700 text-sm font-medium"
                                                                >
                                                                    Edit
                                                                </span> */}
                                <span
                                  onClick={() => handleDeleteClick(agency)}
                                  className="cursor-pointer text-red-600 p-1 rounded hover:text-red-700 text-sm font-medium"
                                >
                                  Delete
                                </span>
                                <span
                                  // onClick={() => {
                                  //     setViewAgency(agency);
                                  //     setOpen(true);
                                  // }}
                                  className="cursor-pointer text-blue-600 p-1 rounded hover:text-blue-700 text-sm font-medium"
                                >
                                  <Link href={`/admin/agencies/${agency._id}`}>
                                      View
                                  </Link>
                                </span>
                                {/* <span className="text-green-600 p-1 rounded hover:text-green-700 text-sm font-medium">
                                  <Link href={`/agent/preference?customerId=${customer._id}`}>
                                      Preference
                                  </Link>
                                </span> */}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </>
                    ) : (
                      <div className="text-center py-12">
                        {/* <UserIcon className="h-24 w-24 text-gray-400 mx-auto mb-4" /> */}
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No agencies yet
                        </h3>
                        <p className="text-gray-500 mb-6">
                          Start building your agency base
                        </p>
                        {/* {!debouncedSearchTerm && (
                          <div className="flex justify-center mt-4">
                            <button
                              // onClick={() => setShowAddForm(true)}
                              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <PlusIcon className="h-5 w-5 mr-2" />
                              Add Agency
                            </button>
                          </div>
                        )} */}
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

      {/* Add Agency Modal */}
      <AddAgencyModal
        isOpen={isAddAgencyModalOpen}
        onClose={() => setAddAgencyModalOpen(false)}
      />
      {/* {(showAddForm || editingAgency) && (
                <AddAgencyModal
                    onClose={() => {
                        setAddAgencyModalOpen(false)
                        setShowAddForm(false);
                        setEditingAgency(null);
                        getAllAgencies();
                    }}
                    onSuccess={() => {
                        setShowAddForm(false);
                        setEditingAgency(null);
                        getAllAgencies();
                    }}
                    initialData={
                    editingAgency
                        ? { ...editingAgency, name: editingAgency.name }
                        : undefined
                    }
                    agencyId={editingAgency?._id}
                />
            )} */}
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
      {/* <AgencyModal
        open={open}
        onClose={() => setOpen(false)}
        agency={viewAgency}
      /> */}
    </div>
  );
}
