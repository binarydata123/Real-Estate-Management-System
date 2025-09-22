"use client";
import React, { useCallback, useEffect } from "react";
import { useState } from "react";
import { PlusIcon, UserIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { AddCustomerForm } from "./AddCustomerForm";
import { deleteCustomerById, getCustomers } from "@/lib/Agent/CustomerAPI";
import { useAuth } from "@/context/AuthContext";
import CustomerModal from "./CustomerModal";
import ConfirmDialog from "@/components/Common/ConfirmDialogBox";
import { Pagination } from "@/components/Common/Pagination";
import SearchInput from "@/components/Common/SearchInput";

export const Customers: React.FC = () => {
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [customers, setCustomers] = useState<CustomerFormData[]>([]);
  const [loading, setLoading] = useState(false);
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
        console.log(response.data.message);
        setCustomers((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (error) {
      console.error("Failed to delete customer:", error);
    }
  };

  const getAllCustomers = useCallback(
    async (page = 1, search = "") => {
      if (!user?._id) return;
      try {
        setLoading(true);
        const res = await getCustomers(user._id, page, limit, search);
        if (res.success) {
          setCustomers(res.data);
          setCurrentPage(res.pagination?.page ?? 1);
          setTotalPages(res.pagination?.totalPages ?? 1);
        }
      } catch (error) {
        console.error("Failed to fetch customers:", error);
      } finally {
        setLoading(false);
      }
    },
    [user?._id]
  );

  useEffect(() => {
    getAllCustomers(currentPage, debouncedSearchTerm);
  }, [getAllCustomers, currentPage, debouncedSearchTerm]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
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
    const formatPrice = (price: number = 0) => {
      if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)}Cr`;
      else if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
      else return `₹${price?.toLocaleString()}`;
    };
    return `${formatPrice(min)} - ${formatPrice(max)}`;
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Title */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 md:mt-1">Manage your customer</p>
        </div>

        {/* Search + Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full md:w-auto">
          <SearchInput
            placeholder="Search by name, email, or phone"
            value={searchTerm}
            onChange={setSearchTerm}
            className="flex-1 sm:max-w-md"
          />
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center justify-center md:px-4 px-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Loading Placeholder */}
      {loading ? (
        <div className="text-center py-12">
          <div className="loader border-t-4 border-b-4 border-blue-600 w-12 h-12 rounded-full mx-auto animate-spin mb-4"></div>
          <p className="text-gray-600">Loading customers...</p>
        </div>
      ) : (
        <>
          {/* Customers List */}
          {customers.length > 0 ? (
            <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="hidden md:grid md:grid-cols-6 gap-4 text-sm font-medium text-gray-600 px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="col-span-2">Customer</div>
                <div>Contact</div>
                <div>Budget Range</div>
                <div>Status</div>
                <div>Actions</div>
              </div>

              <div className="divide-y divide-gray-200">
                {customers.map((customer: CustomerFormData) => (
                  <div
                    key={customer?._id}
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
                      {/* {(customer?.minimumBudget || customer?.maximumBudget) && ( */}
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
                      {/* )} */}

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
                          Contact
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <UserIcon className="h-24 w-24 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No customers yet
              </h3>
              <p className="text-gray-500 mb-6">
                Start building your customer base
              </p>
              {!debouncedSearchTerm && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Customer
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
      {/* Add Customer & Edit Modal */}
      {(showAddForm || editingCustomer) && (
        <AddCustomerForm
          onClose={() => {
            setShowAddForm(false);
            setEditingCustomer(null);
            getAllCustomers();
          }}
          onSuccess={() => {
            setShowAddForm(false);
            setEditingCustomer(null);
            getAllCustomers();
          }}
          initialData={editingCustomer ?? undefined}
          customerId={editingCustomer?._id}
        />
      )}
      {/* Confirm Delete Dialog */}
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
      {/* Customer Modal */}
      <CustomerModal
        open={open}
        onClose={() => setOpen(false)}
        customer={viewCustomer}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        siblingCount={1}
        showFirstLast={true}
        showPrevNext={true}
      />
    </div>
  );
};
