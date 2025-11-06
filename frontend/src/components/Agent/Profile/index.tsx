"use client";
import { useAuth } from "@/context/AuthContext";
import React from "react";

export default function Profile() {
  const { user } = useAuth();

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
      <form className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 border-b border-gray-100 pb-6">
        {/* Full Name */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            defaultValue={user?.name || "John Doe"}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl 
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                       text-gray-900 placeholder-gray-400 transition-all duration-150"
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
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl 
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                       text-gray-900 placeholder-gray-400 transition-all duration-150"
          />
        </div>

        {/* WhatsApp Number */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            WhatsApp Number
          </label>
          <input
            type="tel"
            placeholder="+91 98765 43210"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl 
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                       text-gray-900 placeholder-gray-400 transition-all duration-150"
          />
        </div>

        {/* Timezone */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Timezone
          </label>
          <select
            defaultValue="Asia/Kolkata"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl 
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                       text-gray-900 bg-white transition-all duration-150"
          >
            <option value="Asia/Kolkata">India Standard Time (IST)</option>
            <option value="UTC">Coordinated Universal Time (UTC)</option>
          </select>
        </div>
      </form>

      {/* Save Button */}
      <div className="flex justify-end mt-4">
        <button
          type="submit"
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl shadow-sm 
                     hover:bg-blue-700 transition-colors duration-150 font-medium"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
