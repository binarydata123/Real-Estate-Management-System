'use client';
import React from 'react';
import { useState } from 'react';
import { PlusIcon, UserIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { AddCustomerForm } from './AddCustomerForm';


export const Customers: React.FC = () => {
    const [showAddForm, setShowAddForm] = useState(false);

    // Mock customers data
    const customers = [
        {
            id: '1',
            name: 'Sarah Johnson',
            whatsapp: '+91 98765 43210',
            email: 'sarah@example.com',
            budget_min: 5000000,
            budget_max: 7500000,
            status: 'negotiating',
            assigned_agent: 'John Doe',
            created_at: '2025-01-08T10:00:00Z',
        },
        {
            id: '2',
            name: 'Michael Chen',
            whatsapp: '+91 87654 32109',
            email: 'michael@example.com',
            budget_min: 12000000,
            budget_max: 15000000,
            status: 'interested',
            assigned_agent: 'John Doe',
            created_at: '2025-01-07T15:30:00Z',
        },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'negotiating': return 'bg-orange-100 text-orange-800';
            case 'interested': return 'bg-green-100 text-green-800';
            case 'contacted': return 'bg-blue-100 text-blue-800';
            case 'closed': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatBudget = (min: number, max: number) => {
        const formatPrice = (price: number) => {
            if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)}Cr`;
            else if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
            else return `₹${price.toLocaleString()}`;
        };
        return `${formatPrice(min)} - ${formatPrice(max)}`;
    };

    return (
        <div className="space-y-2">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
                    <p className="text-gray-600 md:mt-1">Manage your customer </p>
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center md:px-4 px-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Customer
                </button>
            </div>

            {/* Customers List */}
            <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="hidden md:grid md:grid-cols-6 gap-4 text-sm font-medium text-gray-600 px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="col-span-2">Customer</div>
                    <div>Contact</div>
                    <div>Budget Range</div>
                    <div>Status</div>
                    <div>Actions</div>
                </div>

                <div className="divide-y divide-gray-200">
                    {customers.map((customer) => (
                        <div key={customer.id} className="p-2 md:p-4 md:grid md:grid-cols-6 md:gap-4 md:items-center md:px-6 hover:bg-gray-50 transition-colors">
                            {/* Customer Info */}
                            <div className="md:col-span-2 flex justify-between items-start">
                                <div className="flex items-center space-x-3">
                                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <UserIcon className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{customer.name}</p>
                                        <p className="text-sm text-gray-600">Assigned to {customer.assigned_agent}</p>
                                    </div>
                                </div>
                                <span className={`md:hidden capitalize inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                                    {customer.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 md:gap-4 mt-2 md:mt-4 md:contents">
                                {/* Contact */}
                                <div>
                                    <div className="md:space-y-1">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <PhoneIcon className="h-4 w-4 hidden md:block mr-2 flex-shrink-0" />
                                            <span>{customer.whatsapp}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 truncate">{customer.email}</p>
                                    </div>
                                </div>

                                {/* Budget */}
                                <div>
                                    <p className="text-xs text-gray-500 md:hidden md:mb-1">Budget</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {formatBudget(customer.budget_min, customer.budget_max)}
                                    </p>
                                </div>

                                {/* Status (desktop) */}
                                <div className="hidden md:block">
                                    <span className={`inline-flex items-center capitalize px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                                        {customer.status}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="col-span-2 md:col-auto flex justify-end md:justify-start space-x-2 md:space-x-4">
                                    <span className="text-blue-600 p-1  rounded hover:text-blue-700 text-sm font-medium">
                                        View
                                    </span>
                                    <span className="text-green-600 p-1  rounded hover:text-green-700 text-sm font-medium">
                                        Contact
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {customers.length === 0 && (
                <div className="text-center py-12">
                    <UserIcon className="h-24 w-24 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No customers yet</h3>
                    <p className="text-gray-500 mb-6">Start building your customer base</p>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Add Your First Customer
                    </button>
                </div>
            )}

            {/* Add Customer Modal */}
            {showAddForm && (
                <AddCustomerForm
                    onClose={() => setShowAddForm(false)}
                    onSuccess={() => {
                        setShowAddForm(false);
                        // Refresh customers list
                    }}
                />
            )}
        </div>
    );
};