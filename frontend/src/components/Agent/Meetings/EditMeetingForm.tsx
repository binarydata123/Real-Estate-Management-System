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

interface EditMeetingFormProps {
  meetingId: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EditMeetingForm: React.FC<EditMeetingFormProps> = ({
  meetingId,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<MeetingFormData | null>(null);
  const { user } = useAuth();

  // Mock data (replace with real queries if needed)
  const mockCustomers = [
    { id: "64f0c1b2f1e2a4b123456789", name: "Sarah Johnson" },
    { id: "64f0c1b2f1e2a4b123456788", name: "Michael Chen" },
    { id: "64f0c1b2f1e2a4b123456787", name: "David Wilson" },
  ];

  const mockProperties = [
    { id: "64f0c2b2f1e2a4b123456780", title: "Luxury 3BHK Apartment" },
    { id: "64f0c2b2f1e2a4b123456781", title: "Premium Commercial Office" },
    { id: "64f0c2b2f1e2a4b123456782", title: "Spacious 4BHK Villa" },
  ];

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
        console.log(meeting);
        // Format date for <input type="date">
        const formattedDate = meeting.date
          ? new Date(meeting.date).toISOString().split("T")[0]
          : "";

        // Prefill form
        setValue("customer", meeting.customer);
        setValue("property", meeting.property || "");
        setValue("agency", meeting.agency);
        setValue("date", formattedDate);
        setValue("time", meeting.time || "");
        setValue("status", meeting.status);
      } catch (err) {
        console.error("Failed to load meeting:", err);
        alert("Failed to load meeting details");
        onClose();
      }
    };

    fetchData();
  }, [meetingId, setValue, onClose]);

  const onSubmit: SubmitHandler<MeetingFormData> = async (data) => {
    setLoading(true);
    try {
      const payload: MeetingFormData = {
        ...data,
        agency: user?.agency?._id,
      };
      if (meetingId) await updateMeeting(meetingId, payload);
      alert("Meeting updated successfully!");
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error("Failed to update meeting:", error);
      alert(error.message || "Failed to update meeting");
    } finally {
      setLoading(false);
    }
  };

  if (!initialData) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <p>Loading meeting details...</p>
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
                {...register("customer")}
                className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a customer</option>
                {mockCustomers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
              {errors.customer && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.customer.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
                Property (Optional)
              </label>
              <select
                {...register("property")}
                className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a property</option>
                {mockProperties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.title}
                  </option>
                ))}
              </select>
              {errors.property && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.property.message}
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
                  className="w-full pl-8 md:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full pl-8 md:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Update Meeting"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
