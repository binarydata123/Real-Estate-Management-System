"use client";

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { getAgentProfile, updateAgentProfile } from "@/lib/Agent/ProfileAPI";
import { zodResolver } from "@hookform/resolvers/zod";
import { agentProfileSchema } from "@/schemas/Admin/agentSchema";
import { showErrorToast, showSuccessToast } from "@/utils/toastHandler";

export default function Profile() {
  const [agent, setAgent] = useState<AgentProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(agentProfileSchema),
    defaultValues: {
      fullName: "",
      email: "",
      whatsapp: "",
      agencyName: "",
    },
  });

  // Fetch profile from API
  const getProfile = async (): Promise<void> => {
    try {
      const res = await getAgentProfile();
      if (res.success && res.data) {
        setAgent(res.data);
      }
    } catch (err) {
      showErrorToast("Error", err);
    }
  };

  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    setLoading(true);
    try {
      const payload: AgentProfileFormData = {
        ...data,
        phoneNumber: "",
      };
      const res = await updateAgentProfile(payload);
      if (res.success && res.message) {
        showSuccessToast(res.message);
      }
    } catch (error) {
      if (error instanceof Error) {
        showErrorToast(error.message);
      } else {
        showErrorToast("Profile update failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  useEffect(() => {
    if (agent) {
      setValue("email", agent.owner?.email);
      setValue("fullName", agent.owner?.name);
      setValue("agencyName", agent.name);
      setValue("whatsapp", agent.whatsAppNumber);
    }
  }, [agent, setValue]);
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
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("fullName")}
            placeholder="John Doe"
            className={`w-full px-4 py-2.5 border ${
              errors.fullName ? "border-red-500" : "border-gray-200"
            } rounded-xl focus:ring-2 focus:ring-primary focus:border-primary 
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
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            disabled
            type="email"
            {...register("email")}
            placeholder="example@gmail.com"
            className={`w-full px-4 py-2.5 border ${
              errors.email ? "border-red-500" : "border-gray-200"
            } rounded-xl focus:ring-2 focus:ring-primary focus:border-primary 
            text-gray-900 placeholder-gray-400 transition-all duration-150 bg-zinc-200 cursor-not-allowed`}
          />
          {errors.email && (
            <span className="text-red-500 text-sm mt-1">
              {errors.email.message}
            </span>
          )}
        </div>

        {/* WhatsApp Number */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            WhatsApp Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            {...register("whatsapp")}
            placeholder="Enter WhatsApp number"
            className={`w-full px-4 py-2.5 border ${
              errors.whatsapp ? "border-red-500" : "border-gray-200"
            } rounded-xl focus:ring-2 focus:ring-primary focus:border-primary 
            text-gray-900 placeholder-gray-400 transition-all duration-150`}
          />
          {errors.whatsapp && (
            <span className="text-red-500 text-sm mt-1">
              {errors.whatsapp.message}
            </span>
          )}
        </div>

        {/* Timezone */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Agency Name <span className="text-red-500">*</span>
          </label>

          <input
            type="text"
            {...register("agencyName", { required: "Agency name is required" })}
            className={`w-full px-4 py-2.5 border ${
              errors.agencyName ? "border-red-500" : "border-gray-200"
            } rounded-xl focus:ring-2 focus:ring-primary focus:border-primary 
    text-gray-900 bg-white transition-all duration-150`}
            placeholder="Enter agency name"
          />

          {errors.agencyName && (
            <span className="text-red-500 text-sm mt-1">
              {errors.agencyName.message}
            </span>
          )}
        </div>

        {/* Save Button */}
        <div className="md:col-span-2 flex justify-end mt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-primary text-white rounded-xl shadow-sm
            hover:bg-primary/80 transition-colors duration-150 font-medium disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );

}
