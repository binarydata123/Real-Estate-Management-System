"use client";
import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  getCustomerProifile,
  updateCustomerProfile,
} from "@/lib/Customer/ProfileAPI";
import { zodResolver } from "@hookform/resolvers/zod";
import { customerProfileSchema } from "@/schemas/Admin/profileSchema";
import { showErrorToast, showSuccessToast } from "@/utils/toastHandler";

export default function Profile() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(customerProfileSchema),
    defaultValues: {
      fullName: "",
      email: "",
      whatsapp: "",
      phoneNumber: "",
    },
  });

  const handleGetProfile = async () => {
    try {
      const res: ApiResponse<Customer> = await getCustomerProifile();
      if (res.success && res.data) {
        setCustomer(res.data);
      }
    } catch (error) {
      showErrorToast("Profile fetch error:", error);
    }
  };

  const onSubmit: SubmitHandler<ProfileFormData> = async (data) => {
    setLoading(true);
    try {
      const res: ApiResponse<Customer> = await updateCustomerProfile(data);
      if (res.success) {
        setLoading(false);
        showSuccessToast(res.message);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        showErrorToast(error.message);
      } else {
        showErrorToast("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetProfile();
  }, []);

  useEffect(() => {
    if (customer) {
      setValue("fullName", customer.fullName);
      setValue("email", customer.email);
      setValue("phoneNumber", customer.phoneNumber);
      setValue("whatsapp", customer.whatsAppNumber || "");
    }
  }, [customer, setValue]);

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8">
      {/* Header */}
      <div className="space-y-1 mb-6 border-b border-gray-100 pb-4">
        <h3 className="text-xl md:text-2xl font-semibold text-gray-900">
          Profile Settings
        </h3>
        <p className="text-gray-500 text-sm">
          Manage your personal details and preferences.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 border-b border-gray-100 pb-6"
      >
        {/* Full Name */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            placeholder="John Doe"
            {...register("fullName")}
            className={`w-full px-4 py-2.5 border ${
              errors.fullName ? "border-red-500" : "border-gray-200"
            } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                       text-gray-900 placeholder-gray-400 transition-all duration-150`}
          />
          {errors.fullName && (
            <span className="text-red-500 text-sm mt-1">
              {errors.fullName.message}
            </span>
          )}
        </div>

        {/* Email Address */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            placeholder="example@gmail.com"
            {...register("email")}
            className={`w-full px-4 py-2.5 border ${
              errors.email ? "border-red-500" : "border-gray-200"
            } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                       text-gray-900 placeholder-gray-400 transition-all duration-150`}
          />
          {errors.email && (
            <span className="text-red-500 text-sm mt-1">
              {errors.email.message}
            </span>
          )}
        </div>

        {/* Phone Number */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            placeholder="+91 98765 43210"
            {...register("phoneNumber")}
            className={`w-full px-4 py-2.5 border ${
              errors.phoneNumber ? "border-red-500" : "border-gray-200"
            } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                       text-gray-900 placeholder-gray-400 transition-all duration-150`}
          />
          {errors.phoneNumber && (
            <span className="text-red-500 text-sm mt-1">
              {errors.phoneNumber.message}
            </span>
          )}
        </div>

        {/* WhatsApp Number */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            WhatsApp Number
          </label>
          <input
            type="tel"
            placeholder="+91 98765 43210"
            {...register("whatsapp")}
            className={`w-full px-4 py-2.5 border ${
              errors.whatsapp ? "border-red-500" : "border-gray-200"
            } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                       text-gray-900 placeholder-gray-400 transition-all duration-150`}
          />
          {errors.whatsapp && (
            <span className="text-red-500 text-sm mt-1">
              {errors.whatsapp.message}
            </span>
          )}
        </div>

        {/* Save Button */}
        <div className="md:col-span-2 flex justify-end mt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl shadow-sm
                     hover:bg-blue-700 transition-colors duration-150 font-medium disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
