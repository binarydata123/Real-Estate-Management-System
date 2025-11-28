"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { XMarkIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { useToast } from "@/context/ToastContext";
import { CustomerFormDataSchema } from "@/schemas/Agent/customerSchema";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { showErrorToast } from "@/utils/toastHandler";
import { inviteAgent, updateAgent } from "@/lib/Agent/InviteAPI ";

// Zod schema for the invite form
const inviteSchema = z.object({
  name: z.string().nonempty("Name is required"),
  phone: z.string().nonempty("Phone number is required"),
  email: z.string().email("Invalid email address").optional(),
  whatsapp: z.string().optional(),
  role: z.enum(["agent", "agency_admin"]).optional(),
  message: z.string().optional(),
});

type InviteFormData = z.infer<typeof inviteSchema>;

export interface AgentMember {
  _id?: string;
  agencyId?: string;
  memberId?: string;
  name: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  role?: "agent" | "agency_admin";
  message?: string;
}

interface InviteAgentModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  member?: AgentMember | null;
}

export const InviteAgentModal: React.FC<InviteAgentModalProps> = ({
  onClose,
  onSuccess,
  member,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const { showPromiseToast } = useToast();
  const isEdit = !!member?._id;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      name: member?.name || "",
      phone: member?.phone || "",
      email: member?.email || "",
      role: "agent",
      message: member?.message || "",
    },
  });

  const onSubmit = async (data: InviteFormData) => {
    setLoading(true);
    const payload = {
      ...data,
      agencyId: user?.agency?._id,
      memberId: member?._id,
    };
    const apiCall = () => {
      if (isEdit) return updateAgent(payload);
      return inviteAgent(payload as unknown as CustomerFormDataSchema);
    };

    try {
      await showPromiseToast(apiCall(), {
        loading: isEdit ? "Updating agent..." : "Sending invitation...",
        success: (response) =>
          // console.log(response);
          response.message ||
          (isEdit
            ? "Member's details updated successfully!"
            : `Invitation sent to ${response.data.user.name}!`),
        error: (err: unknown) => {
          if (axios.isAxiosError(err) && err.response) {
            return err.response.data.message || "Request failed.";
          }
          if (err instanceof Error) return err.message;
          return "Unexpected error.";
        },
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      showErrorToast("Action failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg md:rounded-xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEdit ? "Update Agent" : "Invite Agent"}
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
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              {...register("name")}
              className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              {...register("phone")}
              className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
              placeholder="+91 9876543210"
            />
            {errors.phone && (
              <p className="text-red-600 text-sm mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
              Email Address
            </label>
            <input
              type="email"
              {...register("email")}
              className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
              placeholder="agent@example.com"
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Personal Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
              Personal Message (Optional)
            </label>
            <textarea
              {...register("message")}
              rows={3}
              className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
              placeholder="Welcome to our team! Looking forward to working with you."
            />
          </div>

          {/* Buttons */}
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
              className="flex items-center px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlusIcon className="h-4 w-4 mr-2" />
              {loading
                ? isEdit
                  ? "Updating..."
                  : "Sending..."
                : isEdit
                ? "Update Agent"
                : "Send Invitation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
