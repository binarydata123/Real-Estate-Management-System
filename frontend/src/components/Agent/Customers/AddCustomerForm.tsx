'use client';

import { useAgency } from '@/context/AgencyContext';
import { useAuth } from '@/context/AuthContext';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { XMarkIcon } from '@heroicons/react/24/outline';

const customerSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    whatsapp: z.string().optional(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    phone: z.string().optional(),
    budget_min: z.number().min(0, 'Budget must be positive').optional(),
    budget_max: z.number().min(0, 'Budget must be positive').optional(),
    source: z.enum(['website', 'referral', 'social_media', 'advertisement', 'walk_in', 'cold_call', 'other']),
    notes: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface AddCustomerFormProps {
    onClose: () => void;
    onSuccess?: () => void;
}

export const AddCustomerForm: React.FC<AddCustomerFormProps> = ({ onClose, onSuccess }) => {
    const { currentAgency } = useAgency();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showMoreInfo, setShowMoreInfo] = useState(false);

    const { register, handleSubmit, formState: { errors }, watch } = useForm<CustomerFormData>({
        resolver: zodResolver(customerSchema),
        defaultValues: {
            source: 'website',
        }
    });

    const budgetMin = watch('budget_min');

    const onSubmit = async (data: CustomerFormData) => {
        if (!currentAgency || !user) return;

        setLoading(true);
        try {
            // Demo mode - simulate success
            await new Promise(resolve => setTimeout(resolve, 1000));
            alert('Customer added successfully! (Demo mode)');
            onSuccess?.();
            onClose();
        } catch (error) {
            alert('Demo mode: Customer creation simulated');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 bg-opacity-30 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg md:rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 md:p-6 p-2">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">Add New Customer</h2>
                        <div className="flex items-center space-x-4">
                            <button
                                type="button"
                                onClick={() => setShowMoreInfo(prev => !prev)}
                                className="text-sm font-medium text-blue-600 hover:text-blue-700"
                            >
                                {showMoreInfo ? 'Less Information' : 'More Information'}
                            </button>
                            <span
                                onClick={onClose}
                                className="md:p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                            >
                                <XMarkIcon className="h-5 w-5 text-gray-500" />
                            </span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="md:p-6 p-2  md:space-y-6 space-y-2">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6 gap-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
                                Full Name *
                            </label>
                            <input
                                {...register('name')}
                                className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="John Doe"
                            />
                            {errors.name && (
                                <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
                                WhatsApp Number
                            </label>
                            <input
                                type="tel"
                                {...register('whatsapp')}
                                className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="+91 98765 43210"
                            />
                            <p className="text-xs text-gray-500 mt-1">Used for deduplication and communication</p>
                        </div>
                    </div>

                    {showMoreInfo && (
                        <div className="space-y-2 md:space-y-6">
                            {/* Contact Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6 gap-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        {...register('email')}
                                        className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="john@example.com"
                                    />
                                    {errors.email && (
                                        <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        {...register('phone')}
                                        className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                            </div>

                            {/* Budget Range */}
                            <div className="grid grid-cols-2 md:grid-cols-2 md:gap-6 gap-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
                                        Minimum Budget (₹)
                                    </label>
                                    <input
                                        type="number"
                                        {...register('budget_min', { valueAsNumber: true })}
                                        className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="5000000"
                                    />
                                    {errors.budget_min && (
                                        <p className="text-red-600 text-sm mt-1">{errors.budget_min.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
                                        Maximum Budget (₹)
                                    </label>
                                    <input
                                        type="number"
                                        {...register('budget_max', {
                                            valueAsNumber: true,
                                            validate: (value) => {
                                                if (value && budgetMin && value < budgetMin) {
                                                    return 'Maximum budget must be greater than minimum budget';
                                                }
                                                return true;
                                            }
                                        })}
                                        className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="7500000"
                                    />
                                    {errors.budget_max && (
                                        <p className="text-red-600 text-sm mt-1">{errors.budget_max.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Source */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
                                    Lead Source
                                </label>
                                <select
                                    {...register('source')}
                                    className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="website">Website</option>
                                    <option value="referral">Referral</option>
                                    <option value="social_media">Social Media</option>
                                    <option value="advertisement">Advertisement</option>
                                    <option value="walk_in">Walk-in</option>
                                    <option value="cold_call">Cold Call</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
                                    Initial Notes
                                </label>
                                <textarea
                                    {...register('notes')}
                                    rows={3}
                                    className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Any initial notes about the customer..."
                                />
                            </div>
                        </div>
                    )}

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-2 md:space-x-4 md:pt-6 pt-2 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating...' : 'Add Customer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};