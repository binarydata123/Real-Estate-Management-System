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
            <h2 className="text-xl font-semibold  text-gray-800">
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
  render={({ field }) => (
    <div>
      <select
        {...field}
        className={`w-full pl-3 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
          errors.sharedWithUserId ? "border-red-600" : "border-gray-300"
        }`}
      >
        <option value="">Select customer...</option>

        {options.map((option) => {
          const isAlreadyShared = sharedCustomers.some(
            (shared) => shared._id === option._id
          );

          return (
            <option
              key={option._id}
              value={option._id}
              disabled={isAlreadyShared}
            >
              {option.fullName}
              {isAlreadyShared ? " (Already Shared)" : ""}
            </option>
          );
        })}
      </select>

      {errors.sharedWithUserId && (
        <p className="text-red-600 text-sm mt-1">
          {errors.sharedWithUserId.message}
        </p>
      )}
    </div>
  )}
/>
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
                className="flex items-center px-6 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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
