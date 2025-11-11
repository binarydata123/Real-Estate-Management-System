"use client";
import React from "react";
import {
  KeyIcon,
  ShieldCheckIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

interface SecuritySettingsProps {
  customerSettings: CustomerSettingsType;
  updateCustomerSetting: (
    section: keyof CustomerSettingsType,
    key: string,
    value: string | boolean
  ) => void;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({
  customerSettings,
  updateCustomerSetting,
}) => {
  const { security } = customerSettings;


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
                updateCustomerSetting(
                  "security",
                  "twoFactorAuth",
                  !security?.twoFactorAuth
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
                updateCustomerSetting("security", "sessionTimeout", duration)
              }
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${security?.sessionTimeout === duration
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
                updateCustomerSetting(
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
                            after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
            ></div>
          </label>
        </div>
      </div>

    </div>
  );
};
