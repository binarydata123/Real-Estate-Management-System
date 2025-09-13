'use client';

import React from 'react';
import { CalendarIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';

interface Reminder {
    id: string;
    title: string;
    customer: string;
    time: string;
    type: 'meeting' | 'follow_up' | 'call';
    priority: 'high' | 'medium' | 'low';
}

const TodaysReminders = () => {
    const reminders: Reminder[] = [
        {
            id: '1',
            title: 'Property viewing with Sarah Johnson',
            customer: 'Sarah Johnson',
            time: '10:00 AM',
            type: 'meeting',
            priority: 'high',
        },
        {
            id: '2',
            title: 'Follow up on luxury villa inquiry',
            customer: 'Michael Chen',
            time: '2:30 PM',
            type: 'follow_up',
            priority: 'medium',
        },
        {
            id: '3',
            title: 'Contract signing meeting',
            customer: 'David Wilson',
            time: '4:00 PM',
            type: 'meeting',
            priority: 'high',
        },
    ];

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'border-red-200 bg-red-50';
            case 'medium':
                return 'border-yellow-200 bg-yellow-50';
            case 'low':
                return 'border-green-200 bg-green-50';
            default:
                return 'border-gray-200 bg-gray-50';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'meeting':
                return CalendarIcon;
            case 'follow_up':
                return UserIcon;
            case 'call':
                return UserIcon;
            default:
                return ClockIcon;
        }
    };

    return (
        <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200">
            <div className="md:p-6 p-2 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Today&apos;s Reminders</h2>
            </div>
            <div className="p-2 md:p-6">
                {reminders.length > 0 ? (
                    <div className="md:space-y-4 space-y-2">
                        {reminders.map((reminder) => {
                            const Icon = getTypeIcon(reminder.type);
                            return (
                                <div
                                    key={reminder.id}
                                    className={`p-2 md:p-4 border rounded-lg ${getPriorityColor(
                                        reminder.priority
                                    )} hover:shadow-sm transition-shadow cursor-pointer`}
                                >
                                    <div className="flex md:flex-row flex-col md:items-center justify-between">
                                        <div className="flex items-start md:items-center space-x-3">
                                            <Icon className="h-5 w-5 text-gray-600" />
                                            <div>
                                                <p className="font-medium text-gray-900">{reminder.title}</p>
                                                <p className="text-sm text-gray-600">{reminder.customer}</p>
                                            </div>
                                        </div>
                                        <div className="text-right flex gap-1 items-center flex-row-reverse">
                                            <p className="text-sm font-medium text-gray-900">{reminder.time}</p>
                                            <span
                                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${reminder.priority === 'high'
                                                    ? 'bg-red-100 text-red-800'
                                                    : reminder.priority === 'medium'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-green-100 text-green-800'
                                                    }`}
                                            >
                                                {reminder.priority}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No reminders for today</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TodaysReminders;
