import React from 'react';
import {
    BuildingOfficeIcon,
    UserIcon,
    CalendarIcon,
    BellIcon,
    ClockIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';

export default function CustomerDashboard() {

    const userStats = [
        {
            title: 'Properties ',
            value: '23',
            icon: BuildingOfficeIcon,
            color: 'text-blue-600',
        },
        {
            title: 'Meetings ',
            value: '8',
            icon: CalendarIcon,
            color: 'text-green-600',
        },
        {
            title: 'Saved Properties',
            value: '12',
            icon: UserIcon,
            color: 'text-purple-600',
        },
        {
            title: 'Notifications',
            value: '5',
            icon: BellIcon,
            color: 'text-orange-600',
        },
    ];

    const recentActivity = [
        {
            id: '1',
            action: 'Viewed property: Luxury 3BHK Apartment',
            time: '2 hours ago',
            type: 'property_view',
        },
        {
            id: '2',
            action: 'Meeting scheduled with agent John Doe',
            time: '5 hours ago',
            type: 'meeting',
        },
        {
            id: '3',
            action: 'Saved property: Premium Commercial Office',
            time: '1 day ago',
            type: 'property_save',
        },
        {
            id: '4',
            action: 'Updated budget preferences',
            time: '2 days ago',
            type: 'profile_update',
        },
    ];

    const savedProperties = [
        {
            id: '1',
            title: 'Luxury 3BHK Apartment',
            location: 'Bandra West, Mumbai',
            price: '₹75L',
            image: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg',
        },
        {
            id: '2',
            title: 'Premium Commercial Office',
            location: 'Andheri East, Mumbai',
            price: '₹1.2Cr',
            image: 'https://images.pexels.com/photos/373912/pexels-photo-373912.jpeg',
        },
    ];


    return (
        <div className="min-h-screen bg-gray-50 ">
            <div className="max-w-7xl mx-auto space-y-3 md:space-y-6">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Welcome to Your Dashboard</h1>
                    <p className="text-gray-600">Track your property search and interactions</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                    {userStats.map((stat, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 md:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                                </div>
                                <div className={`p-3 rounded-lg ${stat.color.replace('text', 'bg').replace('-600', '-100')}`}>
                                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
                    {/* Recent Activity */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-3 md:p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                        </div>
                        <div className="p-3 md:p-6">
                            <div className="space-y-2 md:space-y-4">
                                {recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex items-center space-x-3">
                                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <ClockIcon className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-900">{activity.action}</p>
                                            <p className="text-xs text-gray-500">{activity.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Saved Properties */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-3 md:p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Saved Properties</h2>
                        </div>
                        <div className="p-3 md:p-6">
                            <div className="space-y-2 md:space-y-4">
                                {savedProperties.map((property) => (
                                    <div key={property.id} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                        <Image
                                            width={70}
                                            height={70}
                                            src={property.image}
                                            alt={property.title}
                                            className="h-16 w-16 object-cover rounded-lg"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900">{property.title}</h3>
                                            <p className="text-sm text-gray-600">{property.location}</p>
                                            <p className="text-sm font-semibold text-gray-900">{property.price}</p>
                                        </div>
                                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                            View
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className='p-3 md:p-6 border-b border-gray-200'>
                        <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 md:p-6">
                        <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                            <BuildingOfficeIcon className="h-8 w-8 text-blue-600 mb-2" />
                            <h3 className="font-medium text-gray-900">Browse Properties</h3>
                            <p className="text-sm text-gray-600">Explore available properties</p>
                        </button>
                        <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                            <CalendarIcon className="h-8 w-8 text-green-600 mb-2" />
                            <h3 className="font-medium text-gray-900">Schedule Meeting</h3>
                            <p className="text-sm text-gray-600">Book a property viewing</p>
                        </button>
                        <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                            <UserIcon className="h-8 w-8 text-purple-600 mb-2" />
                            <h3 className="font-medium text-gray-900">Update Profile</h3>
                            <p className="text-sm text-gray-600">Manage your preferences</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
