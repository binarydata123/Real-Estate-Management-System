"use client";
import React, { useState } from "react";
import {
  KeyIcon,
  ShieldCheckIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { showErrorToast } from "@/utils/toastHandler";

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
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Demo mode - simulate password change
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Password changed successfully! (Demo mode)");
      setShowPasswordForm(false);
    } catch (error) {
      showErrorToast("Password change simulation failed", error);
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

      {/* Two-Factor Authentication */}
      <div className="p-4 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900 flex items-center">
              <ShieldCheckIcon className="h-5 w-5 mr-2 text-green-600" />
              Two-Factor Authentication
            </h4>
            <p className="text-sm text-gray-600">
              Add an extra layer of security to your account
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={security?.twoFactorAuth || false}
              onChange={() =>
                updateAgencySetting(
                  "security",
                  "twoFactorAuth",
                  !security?.twoFactorAuth,
                )
              }
              className="sr-only peer"
            />
            <div
              className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4
                            peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full
                            peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px]
                            after:left-[2px] after:bg-white after:border-gray-300 after:border
                            after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
            ></div>
          </label>
        </div>

        {security?.twoFactorAuth && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              Two-factor authentication is enabled
            </p>
            <button className="text-sm text-green-700 hover:text-green-800 font-medium mt-1">
              View Recovery Codes
            </button>
          </div>
        )}
      </div>

      {/* Session Timeout */}
      <div className="p-4 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-medium text-gray-900 flex items-center">
              <ClockIcon className="h-5 w-5 mr-2 text-blue-600" />
              Session Timeout
            </h4>
            <p className="text-sm text-gray-600">
              Automatically log out after inactivity
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {["7 days", "15 days", "never"].map((duration) => (
            <button
              key={duration}
              onClick={() =>
                updateAgencySetting("security", "sessionTimeout", duration)
              }
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                security?.sessionTimeout === duration
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {duration}
            </button>
          ))}
        </div>
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
                  !security?.loginNotifications,
                )
              }
              className="sr-only peer"
            />
            <div
              className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4
                            peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full
                            peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px]
                            after:left-[2px] after:bg-white after:border-gray-300 after:border
                            after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
            ></div>
          </label>
        </div>
      </div>

      {/* Password Management */}
      <div className="p-4 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          {/* <div>
            <h4 className="font-medium text-gray-900">Password</h4>
            <p className="text-sm text-gray-600">
              Last changed: {security?.password_last_changed ?? "Unknown"}
            </p>
          </div> */}
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Change Password
          </button>
        </div>

        {showPasswordForm && (
          <form
            onSubmit={handlePasswordChange}
            className="space-y-4 mt-4 p-4 bg-gray-50 rounded-lg"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
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
                           transition-colors disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
              <button
                type="button"
                onClick={() => setShowPasswordForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg
                           hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
