"use client";
import React, { useEffect, useState } from "react";
import { tabs } from "./utils/tabs";
import { renderTabContent } from "./constants/RenderContent";
import {
  getCustomerSettings,
  updateCustomerSettings,
} from "@/lib/Customer/SettingsAPI";
import { showSuccessToast, showErrorToast } from "@/utils/toastHandler";

export const Settings: React.FC = () => {  
  const [activeTab, setActiveTab] = useState("security");
  const [customerSettings, setCustomerSettings] = useState<CustomerSettingsType | null>(null);
  const [settings, setSettings] = useState<CustomerSettingsType | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const updateCustomerSetting = (
    section: keyof CustomerSettingsType,
    field: string,
    value: string | boolean
  ) => {
    setCustomerSettings((prev) => {
      if (!prev) return prev;
      if (typeof prev[section] === "object" && prev[section] !== null) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value,
          },
        };
      }
      return {
        ...prev,
        [section]: value,
      };
    });
  };

  const getSettings = async () => {
    try {
      setInitialLoading(true);
      const res = await getCustomerSettings();
      setCustomerSettings(res);
      setSettings(res);
    } catch (error) {
      console.error("Error fetching settings:", error);
      showErrorToast("Failed to load settings");
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    getSettings();
  }, []);

  const handleUpdateSettings = async () => {
    if (!customerSettings) return;

    const isEqual = JSON.stringify(settings) === JSON.stringify(customerSettings);
    if (isEqual) return;

    setLoading(true);

    try {
      await updateCustomerSettings(customerSettings);
      showSuccessToast("Settings updated successfully");
      // Refresh settings after update
      getSettings();
    } catch {
      showErrorToast("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (initialLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Settings
          </h1>
          <p className="text-gray-600">Loading your settings...</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Settings
        </h1>
        <p className="text-gray-600 md:mt-1">
          Manage your profile and preferences
        </p>
      </div>
      <div className="flex flex-col lg:flex-row gap-2 md:gap-4">
        {/* Sidebar */}
        <div className="w-full lg:w-56">
          <div className="w-screen -mx-2 md:-mx-4 px-2 md:px-4 lg:w-auto lg:mx-0">
            <nav
              className="flex flex-nowrap gap-1.5 overflow-x-auto scrollbar-hide
        bg-white md:rounded-lg shadow-sm border border-gray-200
        md:p-1.5 lg:flex-col lg:overflow-visible"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
              flex items-center flex-shrink-0 px-2.5 md:px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors
              ${activeTab === tab.id
                      ? "bg-blue-50 text-blue-700 border-b-2 lg:border-b-0 lg:border-r-2 border-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }
            `}
                >
                  <tab.icon className="mr-1.5 h-4 w-4" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
            {customerSettings ? (
              renderTabContent(activeTab, customerSettings, updateCustomerSetting)
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Unable to load settings</p>
                <button 
                  onClick={getSettings}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-gray-200 mt-3 md:mt-4">
              <button
                disabled={loading || !customerSettings}
                onClick={handleUpdateSettings}
                className={`px-6 py-2 rounded-lg text-white ${
                  loading || !customerSettings 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};