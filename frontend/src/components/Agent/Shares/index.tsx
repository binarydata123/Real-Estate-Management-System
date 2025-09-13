'use client';
import React from 'react';
import { ShareIcon, EyeIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export const Shares: React.FC = () => {
    // Mock shares data
    const shares = [
        {
            id: '1',
            property: 'Luxury 3BHK Apartment',
            shared_with: 'Sarah Johnson',
            share_type: 'agent_to_customer',
            created_at: '2025-01-09T14:00:00Z',
            views: 3,
            last_viewed: '2025-01-09T16:30:00Z',
            status: 'active'
        },
        {
            id: '2',
            property: 'Premium Commercial Office',
            shared_with: 'Agent: Mike Kumar',
            share_type: 'agent_to_agent',
            created_at: '2025-01-08T11:00:00Z',
            views: 1,
            last_viewed: '2025-01-08T11:15:00Z',
            status: 'active'
        },
        {
            id: '3',
            property: 'Spacious Villa',
            shared_with: 'David Wilson',
            share_type: 'agent_to_customer',
            created_at: '2025-01-07T09:00:00Z',
            views: 8,
            last_viewed: '2025-01-09T12:00:00Z',
            status: 'expired'
        },
    ];

    const getShareTypeColor = (type: string) => {
        return type === 'agent_to_customer'
            ? 'bg-green-100 text-green-800'
            : 'bg-blue-100 text-blue-800';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'expired': return 'bg-red-100 text-red-800';
            case 'revoked': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-2">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Property Shares</h1>
                    <p className="text-gray-600 md:mt-1">Manage property sharing </p>
                </div>
                <div className="flex space-x-3">
                    <select className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                        <option value="">All Shares</option>
                        <option value="agent_to_customer">Customer Shares</option>
                        <option value="agent_to_agent">Agent Shares</option>
                    </select>
                </div>
            </div>

            {/* Shares List */}
            <div className="space-y-2 md:space-y-4">
                {shares.map((share) => (
                    <div key={share.id} className="bg-white rounded-lg md:rounded-xl  shadow-sm border border-gray-200 p-2 md:p-6 hover:shadow-md transition-shadow">
                        <div className="flex md:flex-row flex-col space-y-2 md:space-y-0 items-start justify-between">
                            <div className="flex-1 w-full md:w-auto">
                                <div className="flex items-center space-x-3 md:mb-3 mb-2">
                                    <div className="p-2 bg-orange-100 rounded-lg">
                                        <ShareIcon className="h-5 w-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{share.property}</h3>
                                        <p className="text-sm text-gray-600">Shared with {share.shared_with}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600 mb-1">Shared On</p>
                                        <div className="flex items-center">
                                            <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                                            <span className="font-medium text-gray-900">
                                                {format(new Date(share.created_at), 'MMM dd, yyyy')}
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-gray-600 mb-1">Last Viewed</p>
                                        <span className="font-medium text-gray-900">
                                            {format(new Date(share.last_viewed), 'MMM dd, hh:mm a')}
                                        </span>
                                    </div>

                                    <div>
                                        <p className="text-gray-600 mb-1">Share Type</p>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getShareTypeColor(share.share_type)}`}>
                                            {share.share_type === 'agent_to_customer' ? 'Agent to Customer' : 'Agent to Agent'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 mb-1">Views</p>
                                        <div className="flex items-center">
                                            <EyeIcon className="h-4 w-4 mr-2 text-gray-400" />
                                            <span className="font-medium text-gray-900">{share.views}</span>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <div className="flex md:flex-col justify-between md:justify-start items-center md:items-end space-y-2 w-full md:w-auto">
                                <span className={`inline-flex items-center px-2 py-1 capitalize rounded-full text-xs font-medium ${getStatusColor(share.status)}`}>
                                    {share.status}
                                </span>

                                <div className="flex md:space-x-2">
                                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                        View Link
                                    </button>
                                    <button className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                                        Re-share
                                    </button>
                                    {share.status === 'active' && (
                                        <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                                            Revoke
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {shares.length === 0 && (
                <div className="text-center py-12">
                    <ShareIcon className="h-24 w-24 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No shares yet</h3>
                    <p className="text-gray-500 mb-6">Start sharing properties with customers and colleagues</p>
                    <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <ShareIcon className="h-5 w-5 mr-2" />
                        Share Your First Property
                    </button>
                </div>
            )}
        </div>
    );
};