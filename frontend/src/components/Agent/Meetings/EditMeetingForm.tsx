"use client";
import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { meetingSchema, MeetingFormData } from "@/schemas/Agent/meetingSchema";
import { updateMeeting, getMeetingById } from "@/lib/Agent/MeetingAPI";
import { useAuth } from "@/context/AuthContext";
import { getCustomersForDropDown } from "@/lib/Agent/CustomerAPI";
import { showErrorToast, showSuccessToast } from "@/utils/toastHandler";
import { getProperties } from "@/lib/Agent/PropertyAPI";

interface EditMeetingFormProps {
  meetingId: string | null;
  meetingStatus?: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EditMeetingForm: React.FC<EditMeetingFormProps> = ({
  meetingId,
  meetingStatus,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<MeetingFormData | null>(null);
  const { user } = useAuth();
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>(
    []
  );
  const [properties, setProperties] = useState<Property[]>([]);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<MeetingFormData>({
    resolver: zodResolver(meetingSchema),
  });

  // Fetch existing meeting data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!meetingId) return;
        const result = await getMeetingById(meetingId);
        const meeting = result.data.data;
        setInitialData(meeting);
        // Format date for <input type="date">
        const formattedDate = meeting.date
          ? new Date(meeting.date).toISOString().split("T")[0]
          : "";

        setValue("customerId", meeting.customerId);
        setValue("propertyId", meeting.propertyId || "");
        setValue("agencyId", meeting.agencyId);
        setValue("date", formattedDate);
        setValue("time", meeting.time || "");
        setValue("status", meetingStatus || meeting.status);
      } catch (err) {
        showErrorToast("Failed to load meeting:", err);
        onClose();
      }
    };

    fetchData();
  }, [meetingId, setValue, onClose]);

  useEffect(() => {
    const loadProps = async () => {
      if (!user?.agency?._id) return;

      const { data } = await getProperties({ agencyId: user.agency._id });
      setProperties(data);
    };

    loadProps();
  }, [user?.agency?._id]);

  useEffect(() => {
    const init = async () => {
      if (user?._id) {
        const result = await getCustomersForDropDown(user?._id);

        // extract only _id and fullName
        const filtered = result.data
          .map((c: CustomerFormData) => ({
            id: c._id,
            name: c.fullName,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setCustomers(filtered);
      }
    };
    init();
  }, [user?._id]);

  const onSubmit: SubmitHandler<MeetingFormData> = async (data) => {
    setLoading(true);
    try {
      const payload: MeetingFormData = {
        ...data,
        agencyId: user?.agency?._id,
      };
      if (meetingId) await updateMeeting(meetingId, payload);
      showSuccessToast("Meeting updated successfully!");
      onSuccess?.();
      onClose();
    } catch (error: unknown) {
      if (error instanceof Error) {
        showErrorToast("Failed to update meeting:", error);
      } else {
        showErrorToast("Failed to update meeting:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!initialData) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg md:rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header Skeleton */}
          <div className="sticky top-0 bg-white border-b border-gray-200 md:p-6 p-2">
            <div className="flex items-center justify-between">
              <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
              <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>
          {/* Form Skeleton */}
          <div className="md:p-6 p-2 md:space-y-6 space-y-2 animate-pulse">
            {/* Inputs Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
              <div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 md:gap-6">
              <div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
              </div>
            </div>
            {/* Actions Skeleton */}
            <div className="flex justify-end space-x-2 md:space-x-4 md:pt-6 pt-2 border-t border-gray-200">
              <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
              <div className="h-10 bg-gray-300 rounded-lg w-36"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg md:rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 md:p-6 p-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Edit Meeting
            </h2>
            <span
              onClick={onClose}
              className="md:p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </span>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="md:p-6 p-2 md:space-y-6 space-y-2"
        >
          {/* Customer & Property */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
                Customer Name *
              </label>
              <select
                {...register("customerId")}
                className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
              {errors.customerId && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.customerId.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
                Property (Optional)
              </label>
              <select
                {...register("propertyId")}
                className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
              >
                <option value="">Select a Property</option>
                {properties.map((property) => (
                  <option key={property._id} value={property._id}>
                    {property.title}
                  </option>
                ))}
              </select>
              {errors.propertyId && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.propertyId.message}
                </p>
              )}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-2 md:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
                Date *
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  {...register("date")}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full pl-8 md:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>
              {errors.date && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.date.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
                Time
              </label>
              <div className="relative">
                <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="time"
                  {...register("time")}
                  className="w-full pl-8 md:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>
              {errors.time && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.time.message}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
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
              {loading ? "Updating..." : "Update Meeting"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
