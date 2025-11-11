"use client";

import React, { useEffect, useState } from "react";
import {
  XMarkIcon,
  ShareIcon,
  ChevronUpDownIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { Combobox } from "@headlessui/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { getCustomers } from "@/lib/Agent/CustomerAPI";
import { shareProperty } from "@/lib/Agent/SharePropertyAPI";
import { sharePropertySchema } from "@/schemas/Agent/sharePropertySchema";
import { useToast } from "@/context/ToastContext";
import axios from "axios";
import { showErrorToast } from "@/utils/toastHandler";

type SharePropertyFormData = z.infer<typeof sharePropertySchema>;

interface SharePropertyModalProps {
  property: Property;
  onClose: () => void;
  onSuccess?: () => void;
  sharedCustomers?: { _id: string; fullName: string }[];
}

const SharePropertyModal: React.FC<SharePropertyModalProps> = ({
  property,
  onClose,
  onSuccess,
  sharedCustomers = [],
}) => {
  const { user } = useAuth();
  const [options, setOptions] = useState<CustomerFormData[]>([]);
  const [query, setQuery] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { showPromiseToast } = useToast();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SharePropertyFormData>({
    resolver: zodResolver(sharePropertySchema),
    defaultValues: {
      sharedWithUserId: "",
      message: "",
      propertyId: property?._id || "",
      sharedByUserId: user?._id || "",
      agencyId: user?._id || "",
    },
  });

  useEffect(() => {
    if (!user?._id) return;
    const fetchAll = async () => {
      try {
        const res = await getCustomers(user?._id);
        setOptions(res.data || []);
      } catch (err) {
        showErrorToast("Error:",err);
      }
    };
    fetchAll();
  }, [user?._id]);
  const onSubmit = async (data: SharePropertyFormData) => {
    setLoading(true);

    const apiCall = async () => {
      return shareProperty(data);
    };

    try {
      await showPromiseToast(apiCall(), {
        loading: "Sharing property...",
        success: (response: { status?: number; data?: { message?: string } }) =>
          response.data?.message || "Property shared successfully!",
        error: (err: unknown) => {
          if (axios.isAxiosError(err) && err.response) {
            return err.response.data.message || "Failed to share property.";
          }
          if (err instanceof Error) {
            return err.message || "An unexpected error occurred.";
          }
          return "An unexpected error occurred.";
        },
      });

      onSuccess?.();
      onClose?.();
    } catch (error) {
      showErrorToast("Error:",error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)}Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
    return `₹${price?.toLocaleString()}`;
  };

  const filteredOptions = !query
    ? options
    : options.filter((option) =>
        option.fullName.toLowerCase().includes(query.toLowerCase()),
      );
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 text-black">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Share Property</h2>
          <button
            onClick={onClose}
            className="hover:bg-gray-100 rounded-lg p-2"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4">
          {/* Property Preview */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold">{property.title}</h3>
            <p className="text-gray-600">{property.location}</p>
            <p className="text-lg font-bold mt-1">
              {formatPrice(property.price)}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {!property?._id && (
              <p className="text-red-600 text-sm mb-2">
                Property ID is missing. Please select a valid property.
              </p>
            )}
            {/* Customer Selection */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Select Customer
              </label>
              <Controller
                control={control}
                name="sharedWithUserId"
                render={({ field }) => {
                  const selectedUser =
                    options.find((opt) => opt._id === field.value) || null;

                  return (
                    <Combobox
                      value={selectedUser}
                      onChange={(customer) => field.onChange(customer?._id)}
                    >
                      <div className="relative">
                        <Combobox.Input
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 ${
                            errors.sharedWithUserId
                              ? "border-red-600"
                              : "border-gray-300"
                          }`}
                          displayValue={(customer: CustomerFormData | null) =>
                            customer?.fullName || ""
                          }
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Search customer..."
                          autoComplete="off"
                        />
                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                        </Combobox.Button>

                        {(query === "" || filteredOptions.length > 0) && (
                          <Combobox.Options className="absolute mt-1 w-full max-h-56 overflow-auto rounded-lg border bg-white shadow-lg z-50">
                            {filteredOptions.length === 0 ? (
                              <div className="px-4 py-2 text-gray-500">
                                No customers found
                              </div>
                            ) : (
                              filteredOptions.map((option) => {
                                /** ✅ Disable if already shared */
                                const isAlreadyShared = sharedCustomers.some(
                                  (shared) => shared._id === option._id,
                                );

                                return (
                                  <Combobox.Option
                                    key={option._id}
                                    value={option}
                                    disabled={isAlreadyShared}
                                    className={({ active, disabled }) =>
                                      `flex justify-between px-4 py-2 cursor-pointer ${
                                        disabled
                                          ? "text-gray-400 cursor-not-allowed"
                                          : active
                                          ? "bg-blue-600 text-white"
                                          : "text-gray-700"
                                      }`
                                    }
                                  >
                                    {({ selected }) => (
                                      <>
                                        <span>
                                          {option.fullName}{" "}
                                          {isAlreadyShared &&
                                            "(Already Shared)"}
                                        </span>
                                        {selected && !isAlreadyShared && (
                                          <CheckIcon className="h-4 w-4" />
                                        )}
                                      </>
                                    )}
                                  </Combobox.Option>
                                );
                              })
                            )}
                          </Combobox.Options>
                        )}
                      </div>
                    </Combobox>
                  );
                }}
              />
              {errors.sharedWithUserId && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.sharedWithUserId.message}
                </p>
              )}
            </div>

            {/* Custom Message */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Custom Message (Optional)
              </label>
              <Controller
                control={control}
                name="message"
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500"
                    placeholder="Add a personal message..."
                  />
                )}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShareIcon className="h-4 w-4 mr-2" />
                {loading ? "Sharing..." : "Share Property"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SharePropertyModal;
