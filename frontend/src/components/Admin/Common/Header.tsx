import React, { useState, useEffect, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import {
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon // Import Bars3Icon for mobile menu
} from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';
import { NotificationCenter } from './Notification';
import { getNotifications } from "@/lib/Common/Notifications";

interface HeaderProps {
  onMenuButtonClick: () => void;
}
interface Notification {
  _id: string;
  userId: string;
  agencyId: string;
  message: string;
  type: string;
  read: boolean;
  link: string;
  createdAt: string;
}

export const Header: React.FC<HeaderProps> = ({ onMenuButtonClick }) => {
  const { user, signOut } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  // Fetch notifications for the current user
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?._id) return;
      try {
        const res = await await getNotifications(user._id);
        if (res.data.success == true) {
          setNotifications(res.data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchNotifications();
  }, [user]);

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;
  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="md:px-6  md:py-4 py-2">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <div className='flex gap-1 items-center'>
              <button
                type="button"
                className="lg:hidden p-2 text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-blue-500"
                onClick={onMenuButtonClick}
              >
                <span className="sr-only">Open sidebar</span>
                <Bars3Icon className="h-6 w-6 header-icon" aria-hidden="true" />
              </button>
              {/* Page Title */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">REAMS</h1>
                <p className="text-sm text-gray-500 hidden md:block">Real Estate Management System</p>
              </div>
            </div>
            {/* Right Side */}
            <div className="flex items-center space-x-1 md:space-x-4">
              {/* Agency Switcher */}
              {/* {agencies.length > 1 && (
                <Menu as="div" className="relative">
                  <Menu.Button className="flex items-center text-sm text-gray-700 hover:text-gray-900 focus:outline-none">
                    <span className="mr-2">{currentAgency?.name}</span>
                    <ChevronDownIcon className="h-4 w-4" />
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                      <div className="py-1">
                        {agencies.map((agency) => (
                          <Menu.Item key={agency.agency.id}>
                            {({ active }) => (
                              <button
                                onClick={() => switchAgency(agency.agency.id)}
                                className={`${active ? 'bg-gray-100' : ''
                                  } flex w-full items-center md:px-4 px-2 py-2 text-sm text-gray-700`}
                              >
                                {agency.agency.name}
                              </button>
                            )}
                          </Menu.Item>
                        ))}
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              )} */}

              {/* Notifications */}
              <button
                onClick={() => setShowNotifications(true)}
                className="relative p-2 text-gray-400 hover:text-gray-600 cursor-pointer focus:outline-none"
              >
                <BellIcon className="md:h-6 md:w-6 w-6 h-6 header-icon" />
                {/* <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full"></span> */}
                {unreadCount > 0 && (
                  <>
                    {/* <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                      
                    </span> */}
                    <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white rounded-full text-sm">{unreadCount}</span>
                  </>
                )}
              </button>

              {/* User Menu */}
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <UserCircleIcon className="md:h-8 md:w-8 w-6 h-6 text-gray-400 header-icon" />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-3 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                      </div>
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="/admin/profile"
                            className={`${active ? 'bg-gray-100' : ''
                              } flex items-center md:px-4 px-2 py-2 text-sm text-gray-700`}
                          >
                            <UserCircleIcon className="mr-3 h-4 w-4" />
                            Profile
                          </a>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={signOut}
                            className={`${active ? 'bg-gray-100' : ''
                              } flex w-full items-center md:px-4 px-2 py-2 text-sm text-gray-700`}
                          >
                            <ArrowRightOnRectangleIcon className="mr-3 h-4 w-4" />
                            Sign Out
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </div>
      </header>

      {/* Notification Center */}
      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  );
};