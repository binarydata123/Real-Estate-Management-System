"use client";
import React, { useState, useEffect, useCallback } from "react";
// import { Building2, PlusIcon, UserPlus } from "lucide-react";
import { Building2, PlusIcon } from "lucide-react";
import { getCustomers, deleteCustomerById } from "@/lib/Admin/CustomerAPI";
import ScrollPagination from "@/components/Common/ScrollPagination";
import ConfirmDialog from "@/components/Common/ConfirmDialogBox";
import SearchInput from "@/components/Common/SearchInput";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { showErrorToast, showSuccessToast } from "@/utils/toastHandler";
import CustomerDetailsPopup from "../Common/customerPopup";

// const statusStyles: { [key: string]: string } = {
//   new: "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-400",
//   interested:
//     "bg-pink-100 text-pink-800 dark:bg-pink-500/10 dark:text-pink-400",
//   negotiating:
//     "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-400",
//   converted:
//     "bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400",
//   not_interested:
//     "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400",
//   follow_up:
//     "bg-orange-100 text-orange-800 dark:bg-orange-500/10 dark:text-orange-400",
// };

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Customers() {
  // State to control the Add Agency modal
  const [customers, setCustomers] = useState<CustomerFormData[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerFormData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = "10";
  const [searchTerm, setSearchTerm] = useState("");
  // const [searchStatus, setSearchStatus] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  // const [debouncedSearchStatus, setDebouncedSearchStatus] = useState("");
  const searchParams = useSearchParams();
  const agencyId = searchParams.get("agencyId");
  const [totalRecords, setTotalRecords] = useState(0);

  const [customerData, setCustomerData] = useState<CustomerFormData | null>(
    null
  );
  const [showCustomerDetailsModal, setShowCustomerDetailsModal] =
    useState(false);

  // Calculate stats from mock data
  //const totalCustomers = customers.length;
  // const newCustomers = customers.filter((a) => a.status === "new").length;

  const customerStats = [
    {
      name: "Total Customers",
      value: totalRecords,
      icon: Building2,
      color: "bg-blue-500",
    },
    // {
    //   name: "New",
    //   value: newCustomers,
    //   icon: UserPlus,
    //   color: "bg-indigo-500",
    // },
  ];

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      // setDebouncedSearchStatus(searchStatus);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
    // }, [searchTerm, searchStatus]);
  }, [searchTerm]);
  const handleDeleteClick = (customer: CustomerFormData) => {
    setSelectedCustomer(customer);
    setShowConfirmDialog(true);
  };
  const handleDelete = async (id: string) => {
    try {
      const response = await deleteCustomerById(id);
      if (response.data.success) {
        setCustomers((prev) => prev.filter((c) => c._id !== id));
        showSuccessToast("Customer deleted successfully");
      }
    } catch (error) {
      showErrorToast("Error:", error);
    }
  };
  const getAllCustomers = useCallback(
    async (
      page = 1,
      search = "",
      status = "",
      agencyIdParam = "",
      append = false
    ) => {
      try {
        setIsFetching(true);
        const res = await getCustomers(
          page,
          limit,
          search,
          status,
          agencyIdParam
        );
        if (res.success) {
          setCustomers((prev) => (append ? [...prev, ...res.data] : res.data));
          setCurrentPage(res.pagination?.page ?? 1);
          setTotalPages(res.pagination?.totalPages ?? 1);
          setTotalRecords(res.pagination?.allCustomers ?? 0);
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
    setCustomers([]); // Clear customers on filter change
    getAllCustomers(
      1,
      debouncedSearchTerm,
      // debouncedSearchStatus,
      agencyId || ""
    );
    // }, [getAllCustomers, debouncedSearchTerm, debouncedSearchStatus, agencyId]);
  }, [getAllCustomers, debouncedSearchTerm, agencyId]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || isFetching) return;
    const finalAgencyId = agencyId || "";
    getAllCustomers(page, debouncedSearchTerm, "", finalAgencyId, true);
  };

  const handleCustomerClick = (customer: CustomerFormData) => {
    setCustomerData({
      _id: customer._id,
      agencyId: customer?.agencyId,
      email: customer?.email,
      fullName: customer?.fullName,
      initialNotes: customer?.initialNotes,
      leadSource: customer?.leadSource,
      maximumBudget: customer?.maximumBudget,
      minimumBudget: customer?.minimumBudget,
      phoneNumber: customer?.phoneNumber,
      role: customer?.role,
      showAllProperty: customer?.showAllProperty,
      status: customer?.status,
      whatsAppNumber: customer?.whatsAppNumber,
    });
    document.body.style.overflow = "hidden";
    setShowCustomerDetailsModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="sm:flex sm:items-center sm:justify-between sm:gap-4">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all the customers in the system including their name,
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
          {customerStats.map((item) => (
            <div
              key={item.name}
              className="flex justify-between items-center rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300 p-3 border-t-4 border-blue-500 group"
            >
              <div className="p-5 stats-card-padding-sec w-[100%]">
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
                    <dt className=" text-sm header-tab-sec font-medium text-black dark:text-gray-400">
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

      {/* <hr className="mt-10" /> */}

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
        {/* <div className="mt-4 sm:mt-0 sm:w-auto">
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
            <option value={"new"}>New</option>
            <option value={"interested"}>Interested</option>
            <option value={"negotiating"}>Negotiating</option>
            <option value={"converted"}>Converted</option>
            <option value={"not_interested"}>Not Interested</option>
            <option value={"follow_up"}>Follow Up</option>
          </select>
        </div> */}
      </div>

      <div className="mt-8 flex flex-col">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div id="table-listing-sec" className="shadow-sm md:rounded-lg">
              {isFetching && customers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="loader border-t-4 border-b-4 border-blue-600 w-12 h-12 rounded-full mx-auto animate-spin mb-4"></div>
                  <p className="text-gray-600">Loading Customers...</p>
                </div>
              ) : (
                <>
                  <table className="min-w-full divide-y divide-gray-300 ">
                    {customers.length > 0 ? (
                      <>
                        <thead className="bg-blue-50  dark:bg-gray-800 sticky top-0 z-10">
                          <tr>
                            <th
                              scope="col"
                              className="py-3.5 pl-4 pr-3 text-center text-sm font-semibold text-blue-600 sm:pl-6 dark:text-gray-300"
                            >
                              Customer
                            </th>
                            {/* <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-300">Email</th> */}
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-center text-sm font-semibold text-blue-600 dark:text-gray-300"
                            >
                              Phone
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-center text-sm font-semibold text-blue-600 dark:text-gray-300"
                            >
                              Minimum Budget
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-center text-sm font-semibold text-blue-600 dark:text-gray-300"
                            >
                              Maximum Budget
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-center text-sm font-semibold text-blue-600 dark:text-gray-300"
                            >
                              Agency
                            </th>
                            {/* <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-300"
                            >
                              Status
                            </th> */}
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-center text-sm font-semibold text-blue-600 dark:text-gray-300"
                            >
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white dark:bg-gray-900 dark:divide-gray-700">
                          {customers.map((customer, index) => (
                            <tr key={index}>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                <div className="flex items-center">
                                  <div className="ml-4">
                                    {customer.fullName ? (
                                      <div
                                        className="font-semibold text-blue-600 dark:text-white hover:cursor-pointer hover:underline"
                                        onClick={() =>
                                          handleCustomerClick(customer)
                                        }
                                      >
                                        {customer.fullName}
                                      </div>
                                    ) : (
                                      <span className="font-medium text-gray-400 dark:text-gray-500">
                                        N/A
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              {/* <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{customer.email || 'N/A'}</td> */}
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                <span className="inline-flex items-center px-3 py-1.5 bg-blue-50 font-semibold text-blue-600 font-medium rounded hover:underline hover:bg-blue-100 hover:text-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400">
                                  <a href={`tel:${customer.phoneNumber}`}>
                                    {customer.phoneNumber || "No phone"}
                                  </a>
                                </span>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-center text-gray-500 dark:text-gray-400">
                                {/* <span className="inline-flex items-center px-3 py-1.5 bg-violet-50 font-semibold text-blue-600 font-medium rounded hover:underline hover:bg-violet-100 hover:text-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-400"> */}

                                {customer.minimumBudget?.toLocaleString(
                                  "en-US",
                                  {
                                    style: "currency",
                                    currency: "USD",
                                    maximumFractionDigits: 0,
                                  }
                                ) || "--"}
                                {/* </span> */}
                              </td>
                              <td className="whitespace-nowrap text-gray-500 dark:text-gray-400 text-center px-3 py-4 text-sm">
                                {/* <span className="inline-flex items-center px-3 py-1.5 bg-yellow-50 font-semibold text-gray-600 font-medium rounded hover:bg-yellow-100 hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400"> */}
                                {customer.maximumBudget?.toLocaleString(
                                  "en-US",
                                  {
                                    style: "currency",
                                    currency: "USD",
                                    maximumFractionDigits: 0,
                                  }
                                ) || "--"}
                                {/* </span> */}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm">
                                <div className="flex items-center">
                                  <div className="ml-4">
                                    {customer?.agencyId?.id ? (
                                      <Link
                                        href={`/admin/agencies/${customer.agencyId.id}`}
                                        className="inline-flex items-center px-3 py-1.5 bg-violet-50 font-semibold text-blue-600 font-medium rounded hover:underline hover:bg-violet-100 hover:text-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-400"
                                      >
                                        {customer.agencyId.name || "N/A"}
                                      </Link>
                                    ) : (
                                      <span className="font-medium text-gray-400 dark:text-gray-500">
                                        N/A
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                <span
                                  className={classNames(
                                    statusStyles[customer.status],
                                    "inline-flex capitalize items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                                  )}
                                >
                                  {customer.status
                                    .replace(/_/g, " ")
                                    .replace(/\b\w/g, (char) =>
                                      char.toUpperCase()
                                    )}
                                </span>
                              </td> */}
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                {/* <button className="text-gray-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400"><span className="sr-only">Actions for {agency.name}</span><MoreVertical className="h-5 w-5" /></button> */}
                                {/* <span
                                                                    //onClick={() => setEditingAgency(agency)}
                                                                    className="cursor-pointer text-yellow-600 p-1 rounded hover:text-yellow-700 text-sm font-medium"
                                                                >
                                                                    Edit
                                                                </span> */}
                                <span
                                  onClick={() => handleDeleteClick(customer)}
                                  className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 font-medium rounded hover:bg-red-100 hover:text-red-800 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                                >
                                  Delete
                                </span>
                                {/* <span
                                                                onClick={() => {
                                                                    setViewCustomer(customer);
                                                                    setOpen(true);
                                                                }}
                                                                className="cursor-pointer text-blue-600 p-1 rounded hover:text-blue-700 text-sm font-medium"
                                                                >
                                                                View
                                                                </span>*/}
                                <span className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-700 font-medium rounded hover:bg-green-100 hover:text-green-800 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400">
                                  <Link
                                    href={`/admin/preference?customerId=${customer._id}`}
                                  >
                                    Preference
                                  </Link>
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
                          No customers yet
                        </h3>
                        <p className="text-gray-500 mb-6">
                          Start building your customer base
                        </p>
                        {!debouncedSearchTerm && (
                          <div className="flex justify-center mt-4">
                            <button
                              // onClick={() => setShowAddForm(true)}
                              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <PlusIcon className="h-5 w-5 mr-2" />
                              Add Customer
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </table>
                </>
              )}
            </div>
          </div>
        </div>
        {customers.length > 0 && (
          <div className="w-full flex justify-center items-center my-4 md:my-6">
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

      {showCustomerDetailsModal && (
        <CustomerDetailsPopup
          isOpen={showCustomerDetailsModal}
          onClose={() => {
            setShowCustomerDetailsModal(false);
            document.body.style.overflow = "unset";
          }}
          customerData={customerData}
          agencyName={customerData?.agencyId?.name}
        />
      )}

      {/* Add Property Modal */}
      {/* <AddAgencyModal isOpen={isAddAgencyModalOpen} onClose={() => setAddAgencyModalOpen(false)} /> */}
      <ConfirmDialog
        open={showConfirmDialog}
        onCancel={() => setShowConfirmDialog(false)}
        onConfirm={() => {
          if (selectedCustomer?._id) {
            handleDelete(selectedCustomer._id);
            getAllCustomers();
          }
          setShowConfirmDialog(false);
          setSelectedCustomer(null);
        }}
        heading="Are you sure?"
        description="This customer will be deleted, and this action cannot be undone."
        confirmText="Delete"
        cancelText="Back"
        confirmColor="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
}
