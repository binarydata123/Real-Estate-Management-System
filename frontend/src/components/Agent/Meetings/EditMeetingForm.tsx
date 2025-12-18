"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

import {
  meetingSchema,
  customerMeetingSchema,
  MeetingFormData,
  CustomerMeetingFormData,
} from "@/schemas/Agent/meetingSchema";
import { updateMeeting, getMeetingById } from "@/lib/Agent/MeetingAPI";
import {
  // updateMeetingStatus,
  updateMeeting as updateMeetingCustomer,
  getMeetingById as getMeetingByIdCustomer,
} from "@/lib/Customer/MeetingAPI";

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

interface FormData {
  date: string;
  time: string;
  meetingId:string|null;
  customerId:string|null;
  propertyId:string|null;
  agencyId:string|null;
  status:string|null;
} 

export const EditMeetingForm: React.FC<EditMeetingFormProps> = ({
  meetingId,
  meetingStatus,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const isCustomer = user?.role === "customer";

  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<MeetingFormData | null>(null);
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>(
    []
  );
  const [properties, setProperties] = useState<Property[]>([]);

  const {
    register,
    handleSubmit,
    // setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MeetingFormData | CustomerMeetingFormData>({
    resolver: zodResolver(isCustomer ? customerMeetingSchema : meetingSchema),
    mode: "onSubmit", // Only validate on submit
  });

  // DEBUG: Watch form values and errors
  const formValues = watch();
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!meetingId) {
          console.log("❌ No meeting ID provided");
          return;
        }

        setLoading(true);

        const result = isCustomer
          ? await getMeetingByIdCustomer(meetingId)
          : await getMeetingById(meetingId);

        const meeting = result.data.data;
        console.log("✅ Meeting data loaded:", meeting);
        setInitialData(meeting);

        const formattedDate = meeting.date
          ? new Date(meeting.date).toISOString().split("T")[0]
          : "";

        // Build the form data object
        const formData: FormData = {
          date: formattedDate,
          time: meeting.time || "",
          meetingId: meeting._id,
          customerId: meeting.customerId,
          propertyId: meeting.propertyId || "",
          agencyId: meeting.agencyId, 
          status: meetingStatus || meeting.status,
        };

        // For customers, don't include fields that cause validation errors
        if (!isCustomer) {
          formData.customerId = meeting.customerId;
          formData.propertyId = meeting.propertyId || "";
          formData.agencyId = meeting.agencyId;
          formData.status = meetingStatus || meeting.status;
        }

        // Reset form with all values at once
        reset(formData);
        console.log("✅ Form reset with values:", formData);
      } catch (err) {
        console.error("❌ Error fetching meeting:", err);
        showErrorToast("Failed to load meeting", err);
        onClose();
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [meetingId, isCustomer, reset, onClose, meetingStatus]);


  //LOAD CUSTOMERS (AGENT ONLY)
  
  useEffect(() => {
    if (isCustomer || !user?._id) return;

    const init = async () => {
      try {
        const result = await getCustomersForDropDown(user._id);
        const filtered = result.data
          .map((c: CustomerFormData) => ({
            id: c._id,
            name: c.fullName,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setCustomers(filtered);
      } catch (err) {
        console.error("❌ Error loading customers:", err);
      }
    };

    init();
  }, [user?._id, isCustomer]);

  
   // LOAD PROPERTIES (AGENT ONLY)

  useEffect(() => {
    if (isCustomer || !user?.agency?._id) return;

    const loadProps = async () => {
      try {
        const { data } = await getProperties({ agencyId: user.agency!._id });
        setProperties(data);
      } catch (err) {
        console.error("❌ Error loading properties:", err);
      }
    };

    loadProps();
  }, [user?.agency?._id, isCustomer]);

 
   // SUBMIT HANDLER
  const onSubmit = async (data: MeetingFormData | CustomerMeetingFormData) => {
    

    setLoading(true);
    try {
      if (!meetingId) {
        // console.error("❌ No meeting ID!");
        showErrorToast("Meeting ID is missing");
        return;
      }

      if (isCustomer) {
        // Prepare customer payload
        const customerPayload = {
          date: data.date,
          time: data.time,
        };
        console.log("📤 Sending customer payload:", customerPayload);

        // Update date & time
        const updateResult = await updateMeetingCustomer(
          meetingId,
          customerPayload
        );
        console.log("✅ Update Response:", updateResult);

        showSuccessToast("Meeting updated successfully!");
      } else {
        console.log("🏢 Agent Update Flow");
        // Type guard to ensure we have agent fields
        if (!("customerId" in data)) {
          showErrorToast("Invalid form data for agent");
          return;
        }

        const payload: MeetingFormData = {
          ...(data as MeetingFormData),
          agencyId: user?.agency?._id,
        };
        console.log("📤 Sending agent payload:", payload);
        const result = await updateMeeting(meetingId, payload);
        console.log("✅ Agent Update Response:", result);
        showSuccessToast("Meeting updated successfully!");
      }

      onSuccess?.();
      onClose();
    } catch (error: unknown) {
      console.error("❌ Submit Error:", error);
      showErrorToast("Failed to update meeting", error);
    } finally {
      setLoading(false);
    }
  };

  // MANUAL SUBMIT FOR DEBUGGING
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("MANUAL SUBMIT CLICKED");
    console.log(" Form Values:", formValues);
    console.log("Form Errors:", errors);

    // Try to trigger the form submission
    await handleSubmit(onSubmit)(e);
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
              {meetingStatus === "scheduled"
                ? "Edit Meeting"
                : "Reschedule Meeting"}
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
          onSubmit={handleManualSubmit}
          className="md:p-6 p-2 md:space-y-6 space-y-2"
        >
          {/* CUSTOMER & PROPERTY (AGENT ONLY) */}
          {!isCustomer && (
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
                {/* {errors.customerId as String && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.customerId.message}
                  </p>
                )}*/}
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

                {/* {errors.propertyId && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.propertyId.message}
                  </p>
                )} */}
              </div>
            </div>
          )}

          {/* ✅ DATE & TIME */}
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
                Time *
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
              onClick={() => {          
                onClose();
              }}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isSubmitting}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading || isSubmitting
                ? "Updating..."
                : meetingStatus === "scheduled"
                ? "Update Meeting"
                : "Reschedule Meeting"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

