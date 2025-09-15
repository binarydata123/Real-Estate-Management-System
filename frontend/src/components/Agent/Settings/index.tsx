'use client';
import React, { useState } from 'react';
import {
    UserIcon,
    BuildingOfficeIcon,
    BellIcon,
    PaintBrushIcon,
    UsersIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';
import { TeamManagement } from '../Team/TeamManagement';
import { NotificationSettings } from './NotificationSettings';
import { SecuritySettings } from './SecuritySettings';

export const Settings: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');

    const tabs = [
        { id: 'profile', name: 'Profile', icon: UserIcon },
        { id: 'agency', name: 'Agency Settings', icon: BuildingOfficeIcon },
        { id: 'team', name: 'Team Management', icon: UsersIcon },
        { id: 'branding', name: 'Branding', icon: PaintBrushIcon },
        { id: 'notifications', name: 'Notifications', icon: BellIcon },
        // { id: 'security', name: 'Security', icon: KeyIcon },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="space-y-2 md:space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">Profile Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    defaultValue="John Doe"
                                    className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    defaultValue={user?.email}
                                    className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
                                    WhatsApp Number
                                </label>
                                <input
                                    type="tel"
                                    placeholder="+91 98765 43210"
                                    className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
                                    Timezone
                                </label>
                                <select className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                                    <option value="Asia/Kolkata">India Standard Time (IST)</option>
                                    <option value="UTC">Coordinated Universal Time (UTC)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                );

            case 'agency':
                return (
                    <div className="space-y-2 md:space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">Agency Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
                                    Agency Name
                                </label>
                                <input
                                    type="text"
                                    className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
                                    Workspace URL
                                </label>
                                <div className="flex">
                                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                        reams.app/
                                    </span>
                                    <input
                                        type="text"
                                        className="flex-1 md:px-4 px-2 py-2 border border-gray-300 rounded-r-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'team':
                return <TeamManagement />;

            case 'notifications':
                return <NotificationSettings />;

            case 'security':
                return <SecuritySettings />;
            case 'branding':
                return (
                    <div className="space-y-2 md:space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">Agency Branding</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
                                    Primary Color
                                </label>
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="color"
                                        defaultValue={"#2563eb"}
                                        className="h-10 w-16 border border-gray-300 rounded"
                                    />
                                    <input
                                        type="text"
                                        defaultValue={"#2563eb"}
                                        className="flex-1 md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
                                    Secondary Color
                                </label>
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="color"
                                        defaultValue={"#64748b"}
                                        className="h-10 w-16 border border-gray-300 rounded"
                                    />
                                    <input
                                        type="text"
                                        defaultValue={"#64748b"}
                                        className="flex-1 md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
                                Agency Logo URL
                            </label>
                            <input
                                type="url"
                                placeholder="https://example.com/logo.png"
                                className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <p className="text-gray-600">Settings panel for {activeTab}</p>
                        <p className="text-sm text-gray-500 mt-2">This feature would be implemented here</p>
                    </div>
                );
        }
    };

    return (
        <div className="space-y-2 md:space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600 md:mt-1">Manage your account and agency preferences</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-2 md:gap-6">
                {/* Settings Navigation */}
                <div className="lg:w-64">
                    {/* Wrapper only scrolls on mobile */}
                    <div className="overflow-x-auto lg:overflow-visible">
                        <nav
                            className="
        bg-white md:rounded-xl shadow-sm border border-gray-200 
        flex lg:flex-col space-x-2 lg:space-x-0 md:p-2
        min-w-max lg:min-w-0
      "
                        >
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
            flex items-center flex-shrink-0 md:px-4 px-2 py-2 text-sm font-medium md:rounded-lg transition-colors
            ${activeTab === tab.id
                                            ? 'bg-blue-50 text-blue-700 border-b-2 lg:border-b-0 lg:border-r-2 border-blue-700'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }
          `}
                                >
                                    <tab.icon className="mr-2 h-5 w-5" />
                                    {tab.name}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>



                {/* Settings Content */}
                <div className="flex-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 md:p-6">
                        {renderTabContent()}

                        <div className="flex justify-end pt-6 border-t border-gray-200 mt-2 md:mt-6">
                            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};