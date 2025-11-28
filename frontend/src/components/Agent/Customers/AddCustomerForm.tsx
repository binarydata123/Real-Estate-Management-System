"use client";

import { useAuth } from "@/context/AuthContext";
import React, { useEffect, useState } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { XMarkIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import {
  CustomerFormDataSchema,
  customerSchema,
} from "@/schemas/Agent/customerSchema";
import { createCustomer, updateCustomer } from "@/lib/Agent/CustomerAPI";
import { useToast } from "@/context/ToastContext";
import { showErrorToast } from "@/utils/toastHandler";
import { FormattedNumberInput } from "../Properties/FormattedNumberInput";

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
  // const [showAllProperty, setShowAllProperty] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<CustomerFormDataSchema>({
    resolver: zodResolver(customerSchema),
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
      setShowMoreInfo(true); // Open more info section when editing
    } else {
      reset({ leadSource: "website" });
    }
  }, [initialData, reset]);

  const onSubmit: SubmitHandler<CustomerFormDataSchema> = async (data) => {
    if (!user || !session) {
      showToast("You must be logged in to manage customers.", "error");
      return;
    }
    const dataWithAgency = {
      ...data,
      agencyId: user?.agency?._id,
    };

    setLoading(true);

    const apiCall = async (): Promise<{ data?: { message?: string } }> => {
      try {
        if (customerId) {
          const response = await updateCustomer(customerId, dataWithAgency);
          return { data: { message: response.data?.message } };
          // eslint-disable-next-line no-else-return
        } else {
          const response = await createCustomer(dataWithAgency);
          return { data: { message: response.data?.message } };
        }
      } catch (error) {
        throw error;
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
      showErrorToast(
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
                className="text-sm font-medium text-primary hover:text-primary"
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
                className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
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
                {...register("phoneNumber", {
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(/[^\d+]/g, "");
                  },
                })}
                maxLength={13}
                className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
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
                    className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
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
                    {...register("whatsAppNumber", {
                      onChange: (e) => {
                        e.target.value = e.target.value.replace(/[^\d+]/g, "");
                      },
                    })}
                    maxLength={13}
                    className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
                    placeholder="Enter you WhatsApp number"
                  />
                  {errors.whatsAppNumber && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.whatsAppNumber.message}
                    </p>
                  )}
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
                  <Controller
                    name="minimumBudget"
                    control={control}
                    render={({ field }) => (
                      <FormattedNumberInput
                        value={field.value?.toString() || ""}
                        onChange={(value) =>
                          field.onChange(value ? Number(value) : undefined)
                        }
                        onBlur={field.onBlur}
                        placeholder={field.value ? undefined : "50,00,000"}
                        className={`w-full md:px-4 px-2 py-2 border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary ${
                          errors.minimumBudget
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                    )}
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
                  <Controller
                    name="maximumBudget"
                    control={control}
                    render={({ field }) => (
                      <FormattedNumberInput
                        value={field.value?.toString() || ""}
                        onChange={(value) =>
                          field.onChange(value ? Number(value) : undefined)
                        }
                        onBlur={field.onBlur}
                        placeholder={field.value ? undefined : "75,00,000"}
                        className={`w-full md:px-4 px-2 py-2 border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary ${
                          errors.maximumBudget
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                    )}
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
                  className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
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
                  className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
                  placeholder="Any initial notes about the customer..."
                />
              </div>
              {/* 🔘 Toggle Switch */}
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    {...register("showAllProperty")}
                    // checked={showAllProperty}
                    // onClick={() => setShowAllProperty((prev) => !prev)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-gray-300 rounded-full peer-checked:bg-primary transition-colors"></div>
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform"></div>
                </div>
                <span className="ml-2 text-sm text-gray-700">
                  Show More Info
                </span>
              </label>
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
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
