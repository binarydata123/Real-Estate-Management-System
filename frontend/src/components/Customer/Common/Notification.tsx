import React, { useState } from 'react';
import { BellIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'meeting_reminder' | 'property_shared' | 'customer_activity' | 'system_update' | string;
    read_at: string | null;
    created_at: string;
}

interface NotificationCenterProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: '1',
            title: 'Meeting Reminder',
            message: 'You have a meeting with Sarah Johnson in 30 minutes',
            type: 'meeting_reminder',
            read_at: null,
            created_at: '2025-01-09T09:30:00Z',
        },
        {
            id: '2',
            title: 'Property Shared',
            message: 'Mike Johnson shared "Luxury Villa" with you',
            type: 'property_shared',
            read_at: null,
            created_at: '2025-01-09T08:15:00Z',
        },
        {
            id: '3',
            title: 'New Customer Inquiry',
            message: 'David Wilson is interested in commercial properties',
            type: 'customer_activity',
            read_at: '2025-01-09T07:45:00Z',
            created_at: '2025-01-09T07:30:00Z',
        },
        {
            id: '4',
            title: 'System Update',
            message: 'New features have been added to the platform',
            type: 'system_update',
            read_at: '2025-01-08T18:00:00Z',
            created_at: '2025-01-08T18:00:00Z',
        },
    ]);

    const markAsRead = (notificationId: string) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === notificationId
                    ? { ...notif, read_at: new Date().toISOString() }
                    : notif
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(notif => ({ ...notif, read_at: new Date().toISOString() }))
        );
    };

    const getNotificationIcon = (type: Notification['type']) => {
        switch (type) {
            case 'meeting_reminder':
                return '📅';
            case 'property_shared':
                return '🏠';
            case 'customer_activity':
                return '👤';
            case 'system_update':
                return '🔔';
            default:
                return '📢';
        }
    };

    const unreadCount = notifications.filter(n => !n.read_at).length;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-start justify-center pt-16 p-4 z-50">
            <div className="bg-white rounded-lg md:rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
                {/* Header */}
                <div className="border-b border-gray-200 p-2 md:p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <BellIcon className="h-5 w-5 text-gray-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                            {unreadCount > 0 && (
                                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center space-x-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                >
                                    Mark all read
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <XMarkIcon className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-y-auto max-h-96">
                    {notifications.length > 0 ? (
                        <div className="divide-y divide-gray-200">
                            {notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.read_at ? 'bg-blue-50' : ''
                                        }`}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <div className="flex items-start space-x-3">
                                        <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className={`text-sm font-medium ${!notification.read_at ? 'text-gray-900' : 'text-gray-700'}`}>
                                                    {notification.title}
                                                </p>
                                                {!notification.read_at && (
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 md:mt-1">{notification.message}</p>
                                            <p className="text-xs text-gray-500 mt-2">
                                                {format(new Date(notification.created_at), 'MMM dd, hh:mm a')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No notifications yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
