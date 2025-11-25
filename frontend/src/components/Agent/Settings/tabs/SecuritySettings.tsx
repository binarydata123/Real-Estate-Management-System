"use client";
import React, { useState } from "react";
import { KeyIcon } from "@heroicons/react/24/outline";
import { showErrorToast, showSuccessToast } from "@/utils/toastHandler";
import { changePassword } from "@/lib/Authentication/AuthenticationAPI";
import { useAuth } from "@/context/AuthContext";

interface SecuritySettingsProps {
  agencySettings: AgencySettingsType;
  updateAgencySetting: (
    section: keyof AgencySettingsType,
    key: string,
    value: string | boolean
  ) => void;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({
  agencySettings,
  updateAgencySetting,
}) => {
  const { security } = agencySettings;
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        newPassword,
        oldPassword,
        confirmPassword,
        email: user?.email,
      };
      // Demo mode - simulate password change
      await changePassword(data);
      showSuccessToast("Password updated successfully");
    } catch (error: unknown) {
      if (error && typeof error === "object") {
        const backendError = error as AxiosErrorResponse;
        if (backendError.response?.data?.message) {
          showErrorToast("Error: ", backendError.response.data.message);
        } else if (error instanceof Error) {
          showErrorToast("Error: ", error.message);
        }
      } else if (typeof error !== "object") {
        showErrorToast("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <KeyIcon className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Security Settings
        </h3>
      </div>
      {/* Login Notifications */}
      <div className="p-4 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Login Notifications</h4>
            <p className="text-sm text-gray-600">
              Get notified when someone logs into your account
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={security?.loginNotifications || false}
              onChange={() =>
                updateAgencySetting(
                  "security",
                  "loginNotifications",
                  !security?.loginNotifications
                )
              }
              className="sr-only peer"
            />
            <div
              className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4
                            peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full
                            peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px]
                            after:left-[2px] after:bg-white after:border-gray-300 after:border
                            after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
      </div>

      {/* Password Management */}
      <div className="p-3 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between mb-4 font-semibold">Change Password</div>
        <form
          onSubmit={handlePasswordChange}
          className="space-y-4 mt-4  bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              onChange={(e) => setOldPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg
                           focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg
                           focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg
                           focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                           transition-colors disabled:opacity-50">
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
