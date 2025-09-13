import React, { useState } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';

interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  meeting_reminders: boolean;
  property_updates: boolean;
  customer_activity: boolean;
  system_updates: boolean;
}

export const NotificationSettings: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_notifications: true,
    push_notifications: true,
    meeting_reminders: true,
    property_updates: true,
    customer_activity: true,
    system_updates: false,
  });

  const [loading, setLoading] = useState(false);

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Demo mode - simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Notification preferences saved! (Demo mode)');
    } catch (error) {
      alert('Demo mode: Settings save simulated');
    } finally {
      setLoading(false);
    }
  };

  const notificationOptions = [
    {
      key: 'email_notifications' as keyof NotificationPreferences,
      title: 'Email Notifications',
      description: 'Receive notifications via email',
    },
    {
      key: 'push_notifications' as keyof NotificationPreferences,
      title: 'Push Notifications',
      description: 'Receive browser push notifications',
    },
    {
      key: 'meeting_reminders' as keyof NotificationPreferences,
      title: 'Meeting Reminders',
      description: 'Get reminded about upcoming meetings',
    },
    {
      key: 'property_updates' as keyof NotificationPreferences,
      title: 'Property Updates',
      description: 'Notifications when properties are updated',
    },
    {
      key: 'customer_activity' as keyof NotificationPreferences,
      title: 'Customer Activity',
      description: 'Notifications about customer interactions',
    },
    {
      key: 'system_updates' as keyof NotificationPreferences,
      title: 'System Updates',
      description: 'Notifications about platform updates',
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <BellIcon className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
      </div>

      <div className="md:space-y-4 space-y-2">
        {notificationOptions.map((option) => (
          <div key={option.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">{option.title}</h4>
              <p className="text-sm text-gray-600">{option.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences[option.key]}
                onChange={() => handleToggle(option.key)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
};