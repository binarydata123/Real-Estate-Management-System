"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  XMarkIcon,
  ShareIcon,
  ChevronUpDownIcon,
  CheckIcon,
  UserIcon,
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
import { formatPrice } from "@/utils/helperFunction";

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
        showErrorToast("Error:", err);
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
      showErrorToast("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (url: string) => {
    if (url.startsWith("http")) return url;
    return `${process.env.NEXT_PUBLIC_IMAGE_URL}/Properties/original/${url}`;
  };

  const primaryImage =
    property.images?.find((img) => img.isPrimary)?.url ||
    property.images?.[0]?.url;

  const filteredOptions = !query
    ? options
    : options.filter((option) =>
        option.fullName.toLowerCase().includes(query.toLowerCase())
      );
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 text-black">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-2 md:p-5 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
              <ShareIcon className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Share Property
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-2 md:p-5 overflow-y-auto">
          {/* Property Preview */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-2 md:mb-4 flex items-center gap-4">
            {primaryImage && (
              <Image
                src={getImageUrl(primaryImage)}
                alt={property.title}
                width={80}
                height={80}
                className="rounded-lg object-cover aspect-square"
              />
            )}
            <div>
              <h3 className="font-semibold text-gray-800">{property.title}</h3>
              <p className="text-sm text-gray-600">{property.location}</p>
              <p className="text-lg font-bold text-blue-700 mt-1">
                {formatPrice(property.price as number)}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {!property?._id && (
              <p className="text-red-600 text-sm mb-2">
                Property ID is missing. Please select a valid property.
              </p>
            )}
            {/* Customer Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
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
                          className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
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
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <UserIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                        </Combobox.Button>

                        {(query === "" || filteredOptions.length > 0) && (
                          <Combobox.Options className="absolute mt-1 w-full max-h-56 overflow-auto rounded-xl border bg-white shadow-lg z-50 focus:outline-none">
                            {filteredOptions.length === 0 ? (
                              <div className="px-4 py-2 text-gray-500">
                                No customers found
                              </div>
                            ) : (
                              filteredOptions.map((option) => {
                                /** ✅ Disable if already shared */
                                const isAlreadyShared = sharedCustomers.some(
                                  (shared) => shared._id === option._id
                                );

                                return (
                                  <Combobox.Option
                                    key={option._id}
                                    value={option}
                                    disabled={isAlreadyShared}
                                    className={({ active, disabled }) =>
                                      `flex items-center justify-between px-4 py-2.5 cursor-pointer ${
                                        disabled
                                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                          : active
                                          ? "bg-blue-600 text-white"
                                          : "text-gray-700"
                                      }`
                                    }
                                  >
                                    {({ selected, active }) => (
                                      <>
                                        <div className="flex items-center gap-3">
                                          <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                              active || selected
                                                ? "bg-white text-blue-600"
                                                : "bg-gray-200 text-gray-600"
                                            }`}
                                          >
                                            {option.fullName.charAt(0)}
                                          </div>
                                          <div>
                                            <p className="font-medium">
                                              {option.fullName}
                                            </p>
                                            {isAlreadyShared && (
                                              <span className="text-xs text-gray-500">
                                                Already Shared
                                              </span>
                                            )}
                                          </div>
                                        </div>
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
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Custom Message (Optional)
              </label>
              <Controller
                control={control}
                name="message"
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Add a personal message..."
                  />
                )}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {!loading && <ShareIcon className="h-5 w-5 mr-2" />}
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
