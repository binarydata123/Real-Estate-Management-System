"use client";
import React, { useEffect, useState } from "react";
import { tabs } from "./utils/tabs";
import { renderTabContent } from "./constants/RenderContent";
import {
  getAgencySettings,
  updateAgencySettings,
} from "@/lib/Agent/SettingsAPI";
import { useAuth } from "@/context/AuthContext";
import { showSuccessToast } from "@/utils/toastHandler";

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState("security");
  const { setBrandingColor } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showSkeleton,setShowSkeleton] = useState(false);
  const [agencySettings, setAgencySettings] = useState<AgencySettingsType>({
    _id: "",
    agencySettings: {
      agencyName: "",
      workspaceUrl: "",
    },
    branding: {
      primaryColor: "#3B82F6",
      secondaryColor: "#1F2937",
      agencyLogoUrl: "",
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      meetingReminders: true,
      propertyUpdates: true,
      customerActivity: true,
      systemUpdates: true,
    },
    security: {
      twoFactorAuth: false,
      // sessionTimeout: "7 days",
      loginNotifications: true,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const [settings, setSettings] = useState<AgencySettingsType>();
  const updateAgencySetting = (
    section: keyof AgencySettingsType,
    field: string,
    value: string | boolean
  ) => {
    setAgencySettings((prev) => {
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
    setShowSkeleton(true);
    const res = await getAgencySettings();
    setAgencySettings(res);

    setSettings(res);
    setShowSkeleton(false);
  };
  useEffect(() => {
    getSettings();
  }, []);
 const handleUpdateSettings = async () => {
  if (!agencySettings) return;

  const noChanges = JSON.stringify(settings) === JSON.stringify(agencySettings);
  if (noChanges) return;
  setLoading(true);
  await updateAgencySettings(agencySettings);

  if (agencySettings.branding) {
    setBrandingColor(agencySettings.branding);
  }

  getSettings();
  showSuccessToast("Changes Saved Successfully!");
  setLoading(false);
};

  return (
    <div className="space-y-3 md:space-y-6">
      {showSkeleton ? (
        <div className="animate-pulse">
        <div className="bg-gray-200 w-[70px] h-[15px]"></div>
        <div className="bg-gray-200 mt-2 w-[150px] h-[15px]"></div>
        </div>
      ) : (
        <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Settings
        </h1>
        <p className="text-gray-600 md:mt-1">
          Manage your account and agency preferences
        </p>
      </div>
      )}
      <div className="flex flex-col lg:flex-row gap-2 md:gap-4">
        {/* Sidebar */}
        {showSkeleton ? (
          <div className="bg-gray-200 w-full h-[30px] rounded animate-pulse"></div>
        ) : (
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
              ${
                activeTab === tab.id
                  ? "bg-primary/10 text-primary border-b-2 lg:border-b-0 lg:border-r-2 border-primary"
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
        )}

        {/* Main Content */}
        {showSkeleton ? (
          <div className="h-[485px] p-2 w-full bg-white shadow-sm flex flex-col rounded-[8px] animate-pulse">
            <div className="w-[100px] mt-2 h-[25px] bg-gray-200 rounded-[8px]"></div>
            <div className="w-full mt-2 h-[70px] bg-gray-200 rounded-[8px]"></div>
            <div className="w-full mt-2 h-[300px] bg-gray-200 rounded-[8px]"></div>
            <div className="w-[100px] self-end mt-4 h-[35px] bg-gray-200 rounded-[8px]"></div>
          </div>
        ) : (
          <div className="flex-1 min-w-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
            {agencySettings &&
              renderTabContent(activeTab, agencySettings, updateAgencySetting)}

            <div className="flex justify-end pt-4 border-t border-gray-200 mt-3 md:mt-4">
              <button
                className="px-4 py-1.5 bg-primary/90 text-white text-sm rounded-md hover:bg-primary/80 transition-colors"
                onClick={handleUpdateSettings}
              >
                {loading === true ? "Loading..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};
