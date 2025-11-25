import React from "react";
import { BellIcon } from "@heroicons/react/24/outline";

interface NotificationSettingsProps {
  agencySettings: AgencySettingsType;
  updateAgencySetting: (
    section: keyof AgencySettingsType,
    key: string,
    value: boolean
  ) => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  agencySettings,
  updateAgencySetting,
}) => {
  const preferences = agencySettings?.notifications;

  const notificationOptions = [
    {
      key: "pushNotifications",
      title: "Push Notifications",
      description: "Receive browser push notifications",
    },
    {
      key: "meetingReminders",
      title: "Meeting Reminders",
      description: "Get reminded about upcoming meetings",
    },
    {
      key: "propertyUpdates",
      title: "Property Updates",
      description: "Notifications when properties are updated",
    },
    {
      key: "customerActivity",
      title: "Customer Activity",
      description: "Notifications about customer interactions",
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <BellIcon className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Notification Preferences
        </h3>
      </div>

      <div className="md:space-y-4 space-y-2">
        {notificationOptions.map((option) => (
          <div
            key={option.key}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
          >
            <div>
              <h4 className="font-medium text-gray-900">{option.title}</h4>
              <p className="text-sm text-gray-600">{option.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={
                  preferences?.[option.key as keyof typeof preferences] ?? false
                }
                onChange={() =>
                  updateAgencySetting(
                    "notifications",
                    option.key,
                    !preferences?.[option.key as keyof typeof preferences],
                  )
                }
                className="sr-only peer"
              />
              <div
                className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4
                              peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full
                              peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px]
                              after:left-[2px] after:bg-white after:border-gray-300 after:border
                              after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"
              ></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};
