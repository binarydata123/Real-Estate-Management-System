import React from "react";

export const ProfileSettings = ({ user }) => {
  return (
    <div className="space-y-3 md:space-y-6">
      <h3 className="text-lg md:text-xl font-semibold text-gray-900">
        Profile Settings
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
        {/* Full Name */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            defaultValue="John Doe"
            className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg 
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                       text-gray-900 placeholder-gray-400"
          />
        </div>

        {/* Email Address */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            defaultValue={user?.email || ""}
            className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg 
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                       text-gray-900 placeholder-gray-400"
          />
        </div>

        {/* WhatsApp Number */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            WhatsApp Number
          </label>
          <input
            type="tel"
            // defaultValue={user?.whatsapp || ""}
            placeholder="Enter your WhatsApp number"
            className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg 
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                       text-gray-900 placeholder-gray-400"
          />
        </div>

        {/* Timezone */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Timezone
          </label>
          <select
            className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg 
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                       text-gray-900"
            defaultValue="Asia/Kolkata"
          >
            <option value="Asia/Kolkata">India Standard Time (IST)</option>
            <option value="UTC">Coordinated Universal Time (UTC)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
