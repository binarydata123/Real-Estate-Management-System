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
// import { AddCustomerSelectionModal } from "./AddCustomerSelectionModal";
import { showErrorToast, showSuccessToast } from "@/utils/toastHandler";
import { formatPrice } from "@/utils/helperFunction";
import { NoData } from "@/components/Common/NoData";
import { Users } from "lucide-react";
import { AddMeetingForm } from "@/components/Agent/Meetings/AddMeetingForm";
import { getPreferenceDetail } from "@/lib/Common/Preference";
import { capitalizeFirstLetter } from "@/helper/capitalizeFirstLetter";

export const Customers: React.FC = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<
    (CustomerFormData & { isDeleted?: boolean })[]
  >([]);

  const [isFetching, setIsFetching] = useState(false);
  const [addMode, setAddMode] = useState<"manual" | "ai" | null>(null);
  // const [showSelectionModal, setShowSelectionModal] = useState(false);
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

  const formatBudget = (min?: number, max?: number) => {
    return `${formatPrice(min)} - ${formatPrice(max)}`;
  };

  const handleSelectMode = (mode: "manual" | "ai") => {
    setAddMode(mode);
    // setShowSelectionModal(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] px-1 py-1">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-[8px] mb-4 bg-gradient-to-br from-[#0A2540] via-[#0E2F52] to-[#081C30] border border-[#C9A24D]/20">
        {/* Gold Accent Glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#C9A24D]/10 blur-3xl rounded-full" />

        <div className="relative z-10 p-4 md:p-5">
          {isFetching ? (
            <div className="space-y-4">
              <div className="h-8 w-48 bg-white/20 animate-pulse rounded-lg"></div>
              <div className="h-4 w-64 bg-white/20 animate-pulse rounded-lg"></div>
              <div className="flex gap-3 w-full md:w-auto mt-4">
                <div className="flex-1 md:w-64 bg-white/20 h-11 rounded-lg animate-pulse"></div>
                <div className="w-36 bg-white/20 h-11 rounded-lg animate-pulse"></div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="max-w-3xl">
                <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-1">
                  Customers
                </h1>
                <p className="text-sm sm:text-base text-white/80">
                  Manage and track your customer relationships
                </p>
                
                {/* Divider */}
                <div className="mt-3 h-px w-32 bg-gradient-to-r from-[#C9A24D] to-transparent" />
              </div>

              <div className="flex sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                <SearchInput
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={setSearchTerm}
                  className="flex-1 sm:w-64"
                />
                <button
                  onClick={() => handleSelectMode("manual")}
                  className="flex w-[40%] items-center justify-center px-2 py-2.5 bg-[#C9A24D] text-white rounded-[8px] hover:bg-[#B8914A] transition-all duration-300 shadow-md hover:shadow-lg font-bold"
                >
                  <PlusIcon className="h-5 w-5 mr-2 font-bold stroke-[2.5]" />
                  Add Customer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Empty State */}
      {customers.length === 0 && !isFetching && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
          <NoData
            icon={<Users size={48} className="text-[#0A2540]/40" />}
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
              className="h-[140px] md:h-[110px] w-full bg-white/50 animate-pulse rounded-xl shadow-sm"
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
                  className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-[#C9A24D]/30 transition-all duration-300 overflow-hidden group"
                >
                  <div className="p-4 md:p-5">
                    {/* Top Section */}
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-2">
                      {/* Customer Info */}
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="lg:h-12 lg:w-12 w-9 h-9 bg-gradient-to-br from-[#0A2540] via-[#0E2F52] to-[#081C30] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300 border border-[#C9A24D]/20">
                          <UserIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-6 md:w-6 lg:h-7 lg:w-7 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-[#0A2540] text-base mb-1 truncate">
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
                              className="text-[#C9A24D] hover:text-[#B8914A] font-medium transition-colors hover:underline"
                            >
                              {customer.phoneNumber || "No phone"}
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Budget */}
                      <div className="bg-gradient-to-br from-[#F5F7FA] to-white px-3 py-2 rounded-lg border border-[#C9A24D]/20 shadow-sm">
                        <div className="flex justify-between gap-6">
                          {/* Budget */}
                          <div>
                            <p className="text-xs text-gray-500 font-medium tracking-wide">
                              Budget Range
                            </p>

                            {customer?.minimumBudget ||
                            customer?.maximumBudget ? (
                              <p className="text-sm font-bold text-[#0A2540]">
                                {formatBudget(
                                  customer?.minimumBudget,
                                  customer?.maximumBudget
                                )}
                              </p>
                            ) : (
                              <p className="text-sm text-gray-400">
                                Not Added Yet
                              </p>
                            )}
                          </div>

                          {/* Lead Source */}
                          <div>
                            <p className="text-xs text-gray-500 font-medium tracking-wide">
                              Lead Source
                            </p>

                            <p className="text-sm font-bold text-[#0A2540]">
                              {capitalizeFirstLetter(customer?.leadSource) || "—"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setEditingCustomer(customer)}
                        className="flex-1 sm:flex-none px-3 py-2 bg-gradient-to-r from-[#C9A24D]/10 to-[#C9A24D]/5 text-[#C9A24D] hover:from-[#C9A24D]/20 hover:to-[#C9A24D]/10 rounded-lg text-sm font-semibold transition-all duration-200 border border-[#C9A24D]/30 hover:border-[#C9A24D]/40 shadow-sm hover:shadow text-center"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(customer)}
                        className="flex-1 sm:flex-none px-3 py-2 bg-gradient-to-r from-[#C9A24D]/10 to-[#C9A24D]/5 text-[#C9A24D] hover:from-[#C9A24D]/20 hover:to-[#C9A24D]/10 rounded-lg text-sm font-semibold transition-all duration-200 border border-[#C9A24D]/30 hover:border-[#C9A24D]/40 shadow-sm hover:shadow text-center"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => {
                          setMeetingCustomer(customer);
                          setOpenMeetingModal(true);
                        }}
                        className="flex-1 sm:flex-none px-3 py-2 bg-gradient-to-r from-[#C9A24D]/10 to-[#C9A24D]/5 text-[#C9A24D] hover:from-[#C9A24D]/20 hover:to-[#C9A24D]/10 rounded-lg text-sm font-semibold transition-all duration-200 border border-[#C9A24D]/30 hover:border-[#C9A24D]/40 shadow-sm hover:shadow text-center"
                      >
                        Meeting
                      </button>
                      <button
                        onClick={() => {
                          setViewCustomer(customer);
                          setOpen(true);
                        }}
                        className="flex-1 sm:flex-none px-3 py-2 bg-gradient-to-r from-[#C9A24D]/10 to-[#C9A24D]/5 text-[#C9A24D] hover:from-[#C9A24D]/20 hover:to-[#C9A24D]/10 rounded-lg text-sm font-semibold transition-all duration-200 border border-[#C9A24D]/30 hover:border-[#C9A24D]/40 shadow-sm hover:shadow text-center"
                      >
                        View
                      </button>
                      <Link
                        href={`/agent/preference?customerId=${customer._id}`}
                        className="flex-1 sm:flex-none px-3 py-2 bg-gradient-to-r from-[#C9A24D]/10 to-[#C9A24D]/5 text-[#C9A24D] hover:from-[#C9A24D]/20 hover:to-[#C9A24D]/10 rounded-lg text-sm font-semibold transition-all duration-200 border border-[#C9A24D]/30 hover:border-[#C9A24D]/40 shadow-sm hover:shadow text-center"
                      >
                        Preference
                      </Link>
                      <Link
                        href={`/agent/messages?customerId=${customer._id}`}
                        className="flex-1 sm:flex-none px-3 py-2 bg-[#0A2540] text-[#FFFFFF] hover:from-[#C9A24D]/20 hover:to-[#C9A24D]/10 rounded-lg text-sm font-semibold transition-all duration-200 border border-[#C9A24D]/30 hover:border-[#C9A24D]/40 shadow-sm hover:shadow text-center"
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
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[#C9A24D]/20 border-t-[#C9A24D]"></div>
            </div>
          }
          endMessage={
            <div className="text-center py-8 text-[#C9A24D] font-semibold text-lg">
              🎉 All caught up!
            </div>
          }
        />
      )}

      {/* Modals */}
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