"use client";
import React, { useCallback, useEffect, useState } from "react";
import { PlusIcon, UserIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { AddCustomerForm } from "./AddCustomerForm";
import { deleteCustomerById, getCustomers } from "@/lib/Agent/CustomerAPI";
import { useAuth } from "@/context/AuthContext";
import CustomerModal from "./CustomerModal";
import ConfirmDialog from "@/components/Common/ConfirmDialogBox";
import ScrollPagination from "@/components/Common/ScrollPagination";
import SearchInput from "@/components/Common/SearchInput";
import Link from "next/link";
import CustomerAssistant from "./CustomerAssistant";
import { AddCustomerSelectionModal } from "./AddCustomerSelectionModal";
import { showErrorToast } from "@/utils/toastHandler";
import { formatPrice } from "@/utils/helperFunction";

export const Customers: React.FC = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<CustomerFormData[]>([]);
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

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 400);
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
        setCustomers((prev) => prev.filter((c) => c._id !== id));
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
          setCustomers((prev) => (append ? [...prev, ...res.data] : res.data));
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-gray-100 text-gray-800";
      case "interested":
        return "bg-green-100 text-green-800";
      case "negotiating":
        return "bg-orange-100 text-orange-800";
      case "converted":
        return "bg-purple-100 text-purple-800";
      case "not_interested":
        return "bg-red-100 text-red-800";
      case "follow_up":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatBudget = (min?: number, max?: number) => {
    return `${formatPrice(min)} - ${formatPrice(max)}`;
  };

  const handleSelectMode = (mode: "manual" | "ai") => {
    setAddMode(mode);
    setShowSelectionModal(false);
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 md:mt-1">Manage your customer</p>
        </div>

        <div className="flex  flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full md:w-auto">
          <SearchInput
            placeholder="Search by name, email, or phone"
            value={searchTerm}
            onChange={setSearchTerm}
            className="flex-1 sm:max-w-md "
          />
          <button
            onClick={() => setShowSelectionModal(true)}
            className="flex items-center justify-center md:px-4 px-2 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Customer
          </button>
        </div>
      </div>

      {/* ----------- EMPTY STATE ----------- */}
      {customers.length === 0 && !isFetching && (
        <div className="text-center py-12">
          <UserIcon className="h-24 w-24 text-gray-400 mx-auto mb-4" />
          {debouncedSearchTerm ? (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No customers found
              </h3>
              <p className="text-gray-500 mb-6">
                Your search for &ldquo;{debouncedSearchTerm}&ldquo; did not
                return any results.
              </p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No customers yet
              </h3>
              <p className="text-gray-500 mb-6">
                Start building your customer base by adding your first customer.
              </p>
            </>
          )}
        </div>
      )}

      {/* ----------- MAIN CUSTOMER LIST (UI unchanged) ----------- */}
      {customers.length > 0 && (
        <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="hidden md:grid md:grid-cols-6 gap-4 text-sm font-medium text-gray-600 px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="col-span-2">Customer</div>
            <div>Contact</div>
            <div>Budget Range</div>
            <div>Status</div>
            <div>Actions</div>
          </div>

          <div className="divide-y divide-gray-200">
            {customers.map((customer: CustomerFormData, index) => (
              <div
                key={`${customer._id}-${index}`}
                className="p-2 md:p-4 md:grid md:grid-cols-6 md:gap-4 md:items-center md:px-6 hover:bg-gray-50 transition-colors"
              >
                {/* Customer Info */}
                <div className="md:col-span-2 flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <UserIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {customer?.fullName}
                      </p>
                      <p className="text-sm text-gray-600">
                        Assigned to {customer?.assigned_agent}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`md:hidden capitalize inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      customer?.status
                    )}`}
                  >
                    {customer?.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 md:gap-4 mt-2 md:mt-4 md:contents">
                  {/* Contact */}
                  <div>
                    <div className="md:space-y-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <PhoneIcon className="h-4 w-4 hidden md:block mr-2 flex-shrink-0" />
                        <span>{customer?.whatsAppNumber}</span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {customer?.email}
                      </p>
                    </div>
                  </div>

                  {/* Budget */}
                  <div>
                    <p className="text-xs text-gray-500 md:hidden md:mb-1">
                      Budget
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatBudget(
                        customer?.minimumBudget,
                        customer?.maximumBudget
                      )}
                    </p>
                  </div>

                  {/* Status (desktop) */}
                  <div className="hidden md:block">
                    <span
                      className={`inline-flex items-center capitalize px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        customer?.status
                      )}`}
                    >
                      {customer?.status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 md:col-auto flex justify-end md:justify-start space-x-2 md:space-x-4">
                    <span
                      onClick={() => setEditingCustomer(customer)}
                      className="cursor-pointer text-yellow-600 p-1 rounded hover:text-yellow-700 text-sm font-medium"
                    >
                      Edit
                    </span>
                    <span
                      onClick={() => handleDeleteClick(customer)}
                      className="cursor-pointer text-red-600 p-1 rounded hover:text-red-700 text-sm font-medium"
                    >
                      Delete
                    </span>
                    <span
                      onClick={() => {
                        setViewCustomer(customer);
                        setOpen(true);
                      }}
                      className="cursor-pointer text-blue-600 p-1 rounded hover:text-blue-700 text-sm font-medium"
                    >
                      View
                    </span>
                    <span className="text-green-600 p-1 rounded hover:text-green-700 text-sm font-medium">
                      <Link
                        href={`/agent/preference?customerId=${customer._id}`}
                      >
                        Preference
                      </Link>
                    </span>
                    <span className="text-green-600 p-1 rounded hover:text-green-700 text-sm font-medium">
                      <Link href={`/agent/messages?customerId=${customer._id}`}>
                        Message
                      </Link>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- SMALL INLINE LOADER (NO FLICKER) --- */}
      {isFetching && customers.length > 0 && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
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
            <div className="text-center py-4">
              <div className="loader border-t-4 border-b-4 border-blue-600 w-12 h-12 rounded-full mx-auto animate-spin mb-4"></div>
            </div>
          }
          endMessage={
            <div className="text-center py-8 text-green-600 font-medium">
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
                  minimumBudget: editingCustomer.minimumBudget ?? undefined,
                  maximumBudget: editingCustomer.maximumBudget ?? undefined,
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
    </div>
  );
};
