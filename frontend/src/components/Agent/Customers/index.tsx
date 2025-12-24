"use client";
import React, { useCallback, useEffect, useState } from "react";
import { PlusIcon, UserIcon } from "@heroicons/react/24/outline";
import { AddCustomerForm } from "./AddCustomerForm";
import { deleteCustomerById, getCustomers } from "@/lib/Agent/CustomerAPI";
import { useAuth } from "@/context/AuthContext";
import CustomerModal from "../../Common/CustomerModal";
import ConfirmDialog from "@/components/Common/ConfirmDialogBox";
import ScrollPagination from "@/components/Common/ScrollPagination";
import SearchInput from "@/components/Common/SearchInput";
import Link from "next/link";
import CustomerAssistant from "./CustomerAssistant";
import { AddCustomerSelectionModal } from "./AddCustomerSelectionModal";
import { showErrorToast, showSuccessToast } from "@/utils/toastHandler";
import { formatPrice } from "@/utils/helperFunction";
import { NoData } from "@/components/Common/NoData";
import { Users } from "lucide-react";
import { AddMeetingForm } from "@/components/Agent/Meetings/AddMeetingForm";
import { getPreferenceDetail } from "@/lib/Common/Preference";

export const Customers: React.FC = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<
    (CustomerFormData & { isDeleted?: boolean })[]
  >([]);

  const [isFetching, setIsFetching] = useState(false);
  const [addMode, setAddMode] = useState<"manual" | "ai" | null>(null);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [editingCustomer, setEditingCustomer] =
    useState<CustomerFormData | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerFormData | null>(null);
  const [open, setOpen] = useState(false);
  const [viewCustomer, setViewCustomer] = useState<CustomerFormData | null>(
    null
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [openMeetingModal, setOpenMeetingModal] = useState(false);
  const [meetingCustomer, setMeetingCustomer] =
    useState<CustomerFormData | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 800);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const handleDeleteClick = (customer: CustomerFormData) => {
    setSelectedCustomer(customer);
    setShowConfirmDialog(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await deleteCustomerById(id);
      if (response.data.success) {
        getAllCustomers();
        showSuccessToast("Customer deleted successfully");
      }
    } catch (error) {
      showErrorToast("Failed to delete customer:", error);
    }
  };

  const getAllCustomers = useCallback(
    async (page = 1, search = "", append = false) => {
      if (!user?._id) return;
      try {
        setIsFetching(true);
        const res = await getCustomers(user?._id, page, limit, search);
        if (res.success) {
          const customersData = res.data;

          const customersWithPreferences = await Promise.all(
            customersData.map(async (customer) => {
              try {
                const prefRes = await getPreferenceDetail(customer._id);
                if (prefRes.success && prefRes.data) {
                  return {
                    ...customer,
                    minimumBudget:
                      prefRes.data.minPrice ?? customer.minimumBudget,
                    maximumBudget:
                      prefRes.data.maxPrice ?? customer.maximumBudget,
                  };
                }
              } catch (error) {
                console.log("No preference for customer", error);
              }
              return customer;
            })
          );

          setCustomers((prev) =>
            append
              ? [...prev, ...customersWithPreferences]
              : customersWithPreferences
          );
          setCurrentPage(res.pagination?.page ?? 1);
          setTotalPages(res.pagination?.totalPages ?? 1);
        }
      } catch (error) {
        showErrorToast("Failed to fetch customers:", error);
      } finally {
        setIsFetching(false);
      }
    },
    [user?._id]
  );

  useEffect(() => {
    getAllCustomers(1, debouncedSearchTerm);
  }, [debouncedSearchTerm, getAllCustomers]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && !isFetching) {
      getAllCustomers(page, debouncedSearchTerm, true);
    }
  };

  // const getStatusColor = (status: string) => {
  //   switch (status) {
  //     case "new":
  //       return "bg-gray-100 text-gray-800 border-gray-300";
  //     case "interested":
  //       return "bg-green-50 text-green-700 border-green-200";
  //     case "negotiating":
  //       return "bg-orange-50 text-orange-700 border-orange-200";
  //     case "converted":
  //       return "bg-purple-50 text-purple-700 border-purple-200";
  //     case "not_interested":
  //       return "bg-red-50 text-red-700 border-red-200";
  //     case "follow_up":
  //       return "bg-blue-50 text-blue-700 border-blue-200";
  //     default:
  //       return "bg-gray-100 text-gray-800 border-gray-300";
  //   }
  // };

  const formatBudget = (min?: number, max?: number) => {
    return `${formatPrice(min)} - ${formatPrice(max)}`;
  };

  const handleSelectMode = (mode: "manual" | "ai") => {
    setAddMode(mode);
    setShowSelectionModal(false);
  };

  return (
    <div className="space-y-6 p-2 md:p-4">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 md:p-4 shadow-sm border border-blue-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {isFetching ? (
            <>
              <div className="space-y-2">
                <div className="h-8 w-48 bg-gray-300 animate-pulse rounded"></div>
                <div className="h-4 w-64 bg-gray-200 animate-pulse rounded"></div>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <div className="flex-1 md:w-64 bg-gray-300 h-11 rounded-lg animate-pulse"></div>
                <div className="w-36 bg-gray-300 h-11 rounded-lg animate-pulse"></div>
              </div>
            </>
          ) : (
            <>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
                  Customers
                </h1>
                <p className="text-gray-600 text-sm md:text-base">
                  Manage and track your customer relationships
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                <SearchInput
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={setSearchTerm}
                  className="flex-1 sm:w-64"
                />
                <button
                  onClick={() => setShowSelectionModal(true)}
                  className="flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Customer
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Empty State */}
      {customers.length === 0 && !isFetching && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
          <NoData
            icon={<Users size={48} className="text-gray-400" />}
            heading="No Customers Found"
            description={
              debouncedSearchTerm
                ? `No results found for "${debouncedSearchTerm}". Try a different search term.`
                : "Get started by adding your first customer."
            }
          />
        </div>
      )}

      {/* Loading State */}
      {isFetching && customers.length === 0 ? (
        <div className="grid grid-cols-1 gap-4 md:gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[140px] md:h-[110px] w-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse rounded-xl"
            ></div>
          ))}
        </div>
      ) : (
        customers.length > 0 && (
          <div className="space-y-4 md:space-y-5">
            {customers
              .filter((customer) => !customer.isDeleted)
              .map((customer: CustomerFormData, index) => (
                <div
                  key={`${customer._id}-${index}`}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-300 overflow-hidden group"
                >
                  <div className="p-4 md:p-5">
                    {/* Top Section */}
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-2">
                      {/* Customer Info */}
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="lg:h-12 lg:w-12 w-9 h-9 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300">
                          <UserIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-6 md:w-6 lg:h-7 lg:w-7 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-base mb-1 truncate">
                            {customer.fullName}{" "}
                            {(customer as { isDeleted?: boolean })
                              .isDeleted && (
                              <span className="text-red-500 text-sm">
                                (Deleted)
                              </span>
                            )}
                          </h3>
                          <div className="flex items-center text-sm text-gray-600 group/phone">
                            <a
                              href={`tel:${customer.phoneNumber}`}
                              className="text-blue-600 hover:text-blue-700 font-medium transition-colors hover:underline"
                            >
                              {customer.phoneNumber || "No phone"}
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Budget */}
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex justify-between gap-6">
                          {/* Budget */}
                          <div>
                            <p className="text-xs text-gray-500 font-medium tracking-wide">
                              Budget Range
                            </p>

                            {customer?.minimumBudget ||
                            customer?.maximumBudget ? (
                              <p className="text-sm font-bold text-gray-900">
                                {formatBudget(
                                  customer?.minimumBudget,
                                  customer?.maximumBudget
                                )}
                              </p>
                            ) : (
                              <p className="text-sm text-gray-400">Not Added Yet</p>
                            )}
                          </div>

                          {/* Lead Source */}
                          <div>
                            <p className="text-xs text-gray-500 font-medium tracking-wide">
                              Lead Source
                            </p>

                            <p className="text-sm font-bold text-gray-900">
                              {customer?.leadSource || "—"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    {/* <div className="border-t border-gray-100 my-1"></div> */}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setEditingCustomer(customer)}
                        className="flex-1 sm:flex-none px-3 py-2 bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 hover:from-amber-100 hover:to-yellow-100 rounded-lg text-sm font-semibold transition-all duration-200 border border-amber-200 hover:border-amber-300 shadow-sm hover:shadow"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(customer)}
                        className="flex-1 sm:flex-none px-3 py-2 bg-gradient-to-r from-red-50 to-rose-50 text-red-700 hover:from-red-100 hover:to-rose-100 rounded-lg text-sm font-semibold transition-all duration-200 border border-red-200 hover:border-red-300 shadow-sm hover:shadow"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => {
                          setMeetingCustomer(customer);
                          setOpenMeetingModal(true);
                        }}
                        className="flex-1 sm:flex-none px-3 py-2 bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 hover:from-purple-100 hover:to-violet-100 rounded-lg text-sm font-semibold transition-all duration-200 border border-purple-200 hover:border-purple-300 shadow-sm hover:shadow"
                      >
                        Meeting
                      </button>
                      <button
                        onClick={() => {
                          setViewCustomer(customer);
                          setOpen(true);
                        }}
                        className="flex-1 sm:flex-none px-3 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 hover:from-blue-100 hover:to-cyan-100 rounded-lg text-sm font-semibold transition-all duration-200 border border-blue-200 hover:border-blue-300 shadow-sm hover:shadow"
                      >
                        View
                      </button>
                      <Link
                        href={`/agent/preference?customerId=${customer._id}`}
                        className="flex-1 sm:flex-none px-3 py-2 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 hover:from-emerald-100 hover:to-green-100 rounded-lg text-sm font-semibold transition-all duration-200 border border-emerald-200 hover:border-emerald-300 shadow-sm hover:shadow text-center"
                      >
                        Preference
                      </Link>
                      <Link
                        href={`/agent/messages?customerId=${customer._id}`}
                        className="flex-1 sm:flex-none px-3 py-2 bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-700 hover:from-teal-100 hover:to-cyan-100 rounded-lg text-sm font-semibold transition-all duration-200 border border-teal-200 hover:border-teal-300 shadow-sm hover:shadow text-center"
                      >
                        Message
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )
      )}

      {/* Pagination */}
      {customers.length > 0 && (
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

      {/* Modals */}
      <AddCustomerSelectionModal
        isOpen={showSelectionModal}
        onClose={() => setShowSelectionModal(false)}
        onSelectMode={handleSelectMode}
      />

      {addMode === "ai" && (
        <CustomerAssistant
          onClose={() => {
            setAddMode(null);
            getAllCustomers();
          }}
        />
      )}

      {(addMode === "manual" || editingCustomer) && (
        <AddCustomerForm
          onClose={() => {
            setAddMode(null);
            setEditingCustomer(null);
            getAllCustomers();
          }}
          onSuccess={() => {
            setAddMode(null);
            setEditingCustomer(null);
            getAllCustomers();
          }}
          initialData={
            editingCustomer
              ? {
                  fullName: editingCustomer.fullName,
                  phoneNumber: editingCustomer.phoneNumber ?? "",
                  email: editingCustomer.email ?? "",
                  whatsAppNumber: editingCustomer.whatsAppNumber ?? "",
                  minimumBudget: editingCustomer.minimumBudget
                    ? Number(editingCustomer.minimumBudget)
                    : undefined,
                  maximumBudget: editingCustomer.maximumBudget
                    ? Number(editingCustomer.maximumBudget)
                    : undefined,
                  leadSource: editingCustomer.leadSource ?? "website",
                  initialNotes: editingCustomer.initialNotes ?? "",
                  showAllProperty: editingCustomer.showAllProperty ?? false,
                  agencyId: editingCustomer.agencyId?._id ?? "",
                }
              : undefined
          }
          customerId={editingCustomer?._id}
        />
      )}

      <ConfirmDialog
        open={showConfirmDialog}
        onCancel={() => setShowConfirmDialog(false)}
        onConfirm={() => {
          if (selectedCustomer?._id) {
            handleDelete(selectedCustomer._id);
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

      <CustomerModal
        open={open}
        onClose={() => setOpen(false)}
        customer={viewCustomer}
      />

      {openMeetingModal && meetingCustomer && (
        <AddMeetingForm
          onClose={() => {
            setOpenMeetingModal(false);
            setMeetingCustomer(null);
          }}
          selectedCustomer={{
            id: meetingCustomer._id,
            name: meetingCustomer.fullName,
          }}
          onSuccess={() => {
            setOpenMeetingModal(false);
            setMeetingCustomer(null);
          }}
        />
      )}
    </div>
  );
};