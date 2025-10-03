"use client";

import { useAuth } from "@/context/AuthContext";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { XMarkIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import {
  CustomerFormDataSchema,
  customerSchema,
} from "@/schemas/Agent/customerSchema";
import { createCustomer, updateCustomer } from "@/lib/Agent/CustomerAPI";
import { useToast } from "@/context/ToastContext";

interface AddCustomerFormProps {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: CustomerFormDataSchema;
  customerId?: string;
}

export const AddCustomerForm: React.FC<AddCustomerFormProps> = ({
  onClose,
  onSuccess,
  initialData,
  customerId,
}) => {
  const { user, session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const { showToast, showPromiseToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CustomerFormDataSchema>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      leadSource: "website",
      minimumBudget: 0,
      maximumBudget: 0,
      ...initialData,
    },
  });

  const budgetMin = watch("minimumBudget");

  const onSubmit = async (data: CustomerFormDataSchema) => {
    if (!user || !session) {
      showToast("You must be logged in to manage customers.", "error");
      return;
    }

    const dataWithAgency = {
      ...data,
      agencyId: user?.agency?._id,
    };

    setLoading(true);

    const apiCall = async () => {
      if (customerId) {
        return updateCustomer(customerId, dataWithAgency);
      } else {
        return createCustomer(dataWithAgency);
      }
    };

    try {
      await showPromiseToast(apiCall(), {
        loading: customerId ? "Updating customer..." : "Creating customer...",
        success: (response: { data?: { message?: string } }) =>
          response.data?.message ||
          `Customer ${customerId ? "updated" : "created"} successfully!`,
        error: (err: unknown) => {
          if (axios.isAxiosError(err) && err.response) {
            return (
              err.response.data.message ||
              `Failed to ${customerId ? "update" : "create"} customer.`
            );
          }
          if (err instanceof Error) {
            return err.message || "An unexpected error occurred.";
          }
          return "An unexpected error occurred.";
        },
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error(
        `Customer ${customerId ? "update" : "creation"} failed:`,
        error
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg md:rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 md:p-6 p-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {customerId ? "Edit Customer" : "Add New Customer"}
            </h2>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setShowMoreInfo((prev) => !prev)}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                {showMoreInfo ? "Less Information" : "More Information"}
              </button>
              <span
                onClick={onClose}
                className="md:p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </span>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="md:p-6 p-2  md:space-y-6 space-y-2"
        >
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
                Full Name <span className="text-red-600">*</span>
              </label>
              <input
                {...register("fullName")}
                className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="John Doe"
              />
              {errors.fullName && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.fullName.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
                Phone Number <span className="text-red-600">*</span>
              </label>
              <input
                type="tel"
                {...register("phoneNumber")}
                className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+91 98765 43210"
              />
              {errors.phoneNumber && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>
          </div>

          {showMoreInfo && (
            <div className="space-y-2 md:space-y-6">
              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    {...register("email")}
                    className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="john@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    {...register("whatsAppNumber")}
                    className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+91 98765 43210"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Used for deduplication and communication
                  </p>
                </div>
              </div>

              {/* Budget Range */}
              <div className="grid grid-cols-2 md:grid-cols-2 md:gap-6 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
                    Minimum Budget (₹)
                  </label>
                  <input
                    type="number"
                    {...register("minimumBudget", { valueAsNumber: true })}
                    className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="5000000"
                  />
                  {errors.minimumBudget && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.minimumBudget.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
                    Maximum Budget (₹)
                  </label>
                  <input
                    type="number"
                    {...register("maximumBudget", {
                      valueAsNumber: true,
                      validate: (value) => {
                        if (value && budgetMin && value < budgetMin) {
                          return "Maximum budget must be greater than minimum budget";
                        }
                        return true;
                      },
                    })}
                    className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="7500000"
                  />
                  {errors.maximumBudget && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.maximumBudget.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Source */}
              <div>
                <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
                  Lead Source
                </label>
                <select
                  {...register("leadSource")}
                  className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" disabled>
                    Select lead source...
                  </option>
                  <option value="website">Website</option>
                  <option value="referral">Referral</option>
                  <option value="social_media">Social Media</option>
                  <option value="advertisement">Advertisement</option>
                  <option value="walk_in">Walk-in</option>
                  <option value="cold_call">Cold Call</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
                  Initial Notes
                </label>
                <textarea
                  {...register("initialNotes")}
                  rows={3}
                  className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any initial notes about the customer..."
                />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 md:space-x-4 md:pt-6 pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? customerId
                  ? "Updating..."
                  : "Creating..."
                : customerId
                  ? "Update Customer"
                  : "Add Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
