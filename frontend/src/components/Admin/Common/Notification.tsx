import React, { useState, useEffect } from 'react';
import { BellIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { getNotifications, markAsRead, markAllAsRead } from "@/lib/Common/Notifications";
import { showErrorToast } from '@/utils/toastHandler';

interface Notification {
    _id: string;
    userId: string;
    agencyId: string;
    message: string;
    type: 'meeting_reminder' | 'property_shared' | 'customer_activity' | 'system_update' | string;
    isRead: boolean;
    link: string;
    createdAt: string;
}

interface NotificationCenterProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const fetchNotifications = async () => {
        if (!user?._id) return;

        try {
            const response = await getNotifications(user._id);
            if (response.data.success) {
                setNotifications(response.data.data);
            }
        } catch (err) {
            showErrorToast("Error",err);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [user]);
    const markAsReadNotification = async (notificationId: string) => {
        try {
            await markAsRead(notificationId);
            setNotifications(prev =>
                prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n),
            );
        } catch (err) {
            showErrorToast("Error",err);
        }
    };

    const markAllAsReadNotifications = async () => {
        await markAllAsRead();
        setNotifications(prev =>
            //prev.map(notif => ({ ...notif, read: new Date().toISOString() }))
            prev.map(n => ({ ...n, isRead: true })),
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

    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (!isOpen) return null;

    return (
        <div
            className="absolute right-0 mt-3 w-80 sm:w-96 bg-white 
            rounded-xl shadow-xl border border-gray-200 
            z-50 overflow-hidden animate-dropdown"
            style={{ top: "50px", right: "66px" }}
        >
            {/* Header */}
            <div className="border-b border-gray-200 p-3 flex items-center justify-between bg-gray-50">
                <div className="flex items-center space-x-2">
                    <BellIcon className="h-5 w-5 text-gray-600" />
                    <h2 className="text-base font-semibold text-gray-900">Notifications</h2>
                    {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={() => markAllAsReadNotifications()}
                        className="text-blue-600 cursor-pointer hover:text-blue-700 text-sm font-medium"
                    >
                        Mark all read
                    </button>
                )}
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-200 rounded-lg"
                >
                    <XMarkIcon className="h-5 w-5 text-gray-500" />
                </button>
            </div>

            {/* Scrollable area */}
            <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                    {notifications.map(notification => (
                        <div
                            key={notification._id}
                            className={`p-3 hover:bg-gray-50 cursor-pointer transition ${
                                !notification.isRead ? "bg-blue-50" : ""
                            }`}
                            onClick={() => markAsReadNotification(notification._id)}
                        >
                            {notification.link
                                ?
                                    <a href={`/admin${notification.link}`}>
                                        <div className="flex items-start space-x-3">
                                            <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                                                        {notification.type
                                                            .split('_')
                                                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                            .join(' ')}
                                                    </p>
                                                    {!notification.isRead && (
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 md:mt-1">{notification.message}</p>
                                                <p className="text-xs text-gray-500 mt-2">
                                                    {format(new Date(notification.createdAt), 'MMM dd, hh:mm a')}
                                                </p>
                                            </div>
                                        </div>
                                    </a>
                                :
                                    <div className="flex items-start space-x-3">
                                        <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                                                    {notification.type
                                                        .split('_')
                                                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                        .join(' ')}
                                                </p>
                                                {!notification.isRead && (
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 md:mt-1">{notification.message}</p>
                                            <p className="text-xs text-gray-500 mt-2">
                                                {format(new Date(notification.createdAt), 'MMM dd, hh:mm a')}
                                            </p>
                                        </div>
                                    </div>  
                            }
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
        // <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-start justify-center pt-16 p-4 z-50">
        //     <div className="bg-white rounded-lg md:rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
        //         {/* Header */}
        //         <div className="border-b border-gray-200 p-2 md:p-4">
        //             <div className="flex items-center justify-between">
        //                 <div className="flex items-center space-x-2">
        //                     <BellIcon className="h-5 w-5 text-gray-600" />
        //                     <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
        //                     {unreadCount > 0 && (
        //                         <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
        //                             {unreadCount}
        //                         </span>
        //                     )}
        //                 </div>
        //                 <div className="flex items-center space-x-2">
        //                     {unreadCount > 0 && (
        //                         <button
        //                             onClick={() => markAllAsReadNotifications()}
        //                             className="text-blue-600 cursor-pointer hover:text-blue-700 text-sm font-medium"
        //                         >
        //                             Mark all read
        //                         </button>
        //                     )}
        //                     <button
        //                         onClick={onClose}
        //                         className="p-1 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors"
        //                     >
        //                         <XMarkIcon className="h-5 w-5 text-gray-500" />
        //                     </button>
        //                 </div>
        //             </div>
        //         </div>

        //         <div className="overflow-y-auto max-h-96">
        //             {notifications.length > 0 ? (
        //                 <div className="divide-y divide-gray-200">
        //                     {notifications.map(notification => (
        //                         <div
        //                             key={notification._id}
        //                             className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50' : ''
        //                                 }`}
        //                             onClick={() => markAsReadNotification(notification._id)}
        //                         >
        //                             {notification.link
        //                                 ?
        //                                     <a href={`/admin${notification.link}`}>
        //                                         <div className="flex items-start space-x-3">
        //                                             <span className="text-lg">{getNotificationIcon(notification.type)}</span>
        //                                             <div className="flex-1 min-w-0">
        //                                                 <div className="flex items-center justify-between">
        //                                                     <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
        //                                                         {notification.type
        //                                                             .split('_')
        //                                                             .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        //                                                             .join(' ')}
        //                                                     </p>
        //                                                     {!notification.read && (
        //                                                         <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        //                                                     )}
        //                                                 </div>
        //                                                 <p className="text-sm text-gray-600 md:mt-1">{notification.message}</p>
        //                                                 <p className="text-xs text-gray-500 mt-2">
        //                                                     {format(new Date(notification.createdAt), 'MMM dd, hh:mm a')}
        //                                                 </p>
        //                                             </div>
        //                                         </div>
        //                                     </a>
        //                                 :
        //                                     <div className="flex items-start space-x-3">
        //                                         <span className="text-lg">{getNotificationIcon(notification.type)}</span>
        //                                         <div className="flex-1 min-w-0">
        //                                             <div className="flex items-center justify-between">
        //                                                 <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
        //                                                     {notification.type
        //                                                         .split('_')
        //                                                         .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        //                                                         .join(' ')}
        //                                                 </p>
        //                                                 {!notification.read && (
        //                                                     <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        //                                                 )}
        //                                             </div>
        //                                             <p className="text-sm text-gray-600 md:mt-1">{notification.message}</p>
        //                                             <p className="text-xs text-gray-500 mt-2">
        //                                                 {format(new Date(notification.createdAt), 'MMM dd, hh:mm a')}
        //                                             </p>
        //                                         </div>
        //                                     </div>  }
        //                                                                 </div>
        //                     ))}
        //                 </div>
        //             ) : (
        //                 <div className="p-8 text-center">
        //                     <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        //                     <p className="text-gray-500">No notifications yet</p>
        //                 </div>
        //             )}
        //         </div>
        //     </div>
        // </div>
    );
};
