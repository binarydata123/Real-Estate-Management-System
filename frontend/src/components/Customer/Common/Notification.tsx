import React, { useEffect, useRef, useState } from 'react';
import { BellIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { getNotifications, markAllAsRead, markAsRead } from '@/lib/Common/Notifications';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { showErrorToast } from '@/utils/toastHandler';
interface Notification {
    _id: string;
    title: string;
    message: string;
    type: 'meeting_reminder' | 'property_shared' | 'customer_activity' | 'system_update' | string;
    isRead: string | null;
    createdAt: string;
}

interface NotificationCenterProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
     const { user } = useAuth();
     const [notifications, setNotifications] = useState<Notification[]>([]);
     const [unreadCount,setUnreadCount]=useState(0);
     const modalRef = useRef<HTMLDivElement>(null);
         const fetchNotifications = async () => {
             if (!user?._id) return;
             try {
                 const response = await getNotifications(user._id, {
        type: "unread",
        page: 1,
        limit: 10,
      });
                 if (response.data.success&&response.data.data) {
                     setNotifications(response.data.data||[]);
                 }
             } catch (err) {
                  showErrorToast("Error",err);
             }
         };
         useEffect(() => {
             fetchNotifications();
         }, [user]);

  useEffect(() => {
   setUnreadCount(notifications.length);
  },[notifications]);
    const handelMarkAsRead = async(notificationId: string) => {
           setNotifications(prev =>
            prev.map(notif =>
                notif._id === notificationId
                    ? { ...notif, isRead: new Date().toISOString() }
                    : notif,
            ),
        );
        try {
           await markAsRead(notificationId);
           fetchNotifications();
        } catch (error) {
             showErrorToast("Error",error);
        }
    };

      const handleMarkAllRead = async () => {
        if (unreadCount === 0) return;
        const result = await markAllAsRead();
        if (result.data.success) {
          fetchNotifications();
        }
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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div  className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-start justify-end pt-16 p-4 z-50 ">
            <div ref={modalRef} className="bg-white rounded-lg md:rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden md:mr-12">
                {/* Header */}
                <div className="border-b border-gray-200 p-2 md:p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <BellIcon className="h-5 w-5 text-gray-600" />
                            <h2 className="text-lg font-semibold text-gray-900"><Link href={"/customer/notifications"}>Notifications</Link></h2>
                            {unreadCount > 0 && (
                                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center space-x-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
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
                                    key={notification._id}
                                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''
                                        }`}
                                    onClick={() => handelMarkAsRead(notification._id)}
                                >
                                    <div className="flex items-start space-x-3">
                                        <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                                                    {notification.title}
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

