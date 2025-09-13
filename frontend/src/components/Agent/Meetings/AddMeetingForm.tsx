'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { XMarkIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';

const meetingSchema = z.object({
    customer_name: z.string().min(1, 'Customer name is required'),
    property_title: z.string().optional(),
    scheduled_date: z.string().min(1, 'Date is required'),
    scheduled_time: z.string().min(1, 'Time is required'),
});

type MeetingFormData = z.infer<typeof meetingSchema>;

interface AddMeetingFormProps {
    onClose: () => void;
    onSuccess?: () => void;
}

export const AddMeetingForm: React.FC<AddMeetingFormProps> = ({ onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);

    // Mock data for dropdowns - in a real app, this would come from context or API
    const mockCustomers = [
        { id: '1', name: 'Sarah Johnson' },
        { id: '2', name: 'Michael Chen' },
        { id: '3', name: 'David Wilson' },
    ];

    const mockProperties = [
        { id: '1', title: 'Luxury 3BHK Apartment' },
        { id: '2', title: 'Premium Commercial Office' },
        { id: '3', title: 'Spacious 4BHK Villa' },
    ];

    const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<MeetingFormData>({
        resolver: zodResolver(meetingSchema),
    });

    const onSubmit = async (data: MeetingFormData) => {
        setLoading(true);
        try {
            // Demo mode - simulate success
            await new Promise(resolve => setTimeout(resolve, 1000));
            alert('Meeting scheduled successfully! (Demo mode)');
            onSuccess?.();
            onClose();
        } catch (error) {
            alert('Demo mode: Meeting scheduling simulated');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 bg-opacity-30 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg md:rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 md:p-6 p-2">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">Schedule Meeting</h2>
                        <span
                            onClick={onClose}
                            className="md:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <XMarkIcon className="h-5 w-5 text-gray-500" />
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="md:p-6 p-2  md:space-y-6 space-y-2">
                    {/* Customer and Property */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
                                Customer Name *
                            </label>
                            <select
                                {...register('customer_name')}
                                className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Select a customer</option>
                                {mockCustomers.map((customer) => (
                                    <option key={customer.id} value={customer.name}>
                                        {customer.name}
                                    </option>
                                ))}
                            </select>
                            {errors.customer_name && (
                                <p className="text-red-600 text-sm mt-1">{errors.customer_name.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
                                Property (Optional)
                            </label>
                            <select
                                {...register('property_title')}
                                className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <>
                                    <option value="">Select a property</option>
                                    {mockProperties.map((property) => (
                                        <option key={property.id} value={property.title}>
                                            {property.title}
                                        </option>
                                    ))}
                                </>
                            </select>
                        </div>
                    </div>

                    {/* Date and Time */}
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-2 md:gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
                                Date *
                            </label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="date"
                                    {...register('scheduled_date')}
                                    className="w-full pl-8 md:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            {errors.scheduled_date && (
                                <p className="text-red-600 text-sm mt-1">{errors.scheduled_date.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
                                Time *
                            </label>
                            <div className="relative">
                                <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="time"
                                    {...register('scheduled_time')}
                                    className="w-full pl-8 md:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            {errors.scheduled_time && (
                                <p className="text-red-600 text-sm mt-1">{errors.scheduled_time.message}</p>
                            )}
                        </div>
                    </div>


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
                            {loading ? 'Scheduling...' : 'Schedule Meeting'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};