import React, { useState, useEffect, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import {
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  Cog6ToothIcon,
  //QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';
import { NotificationCenter } from './Notification';
import { getNotifications } from "@/lib/Common/Notifications";
import { showErrorToast } from '@/utils/toastHandler';
import Image from 'next/image';

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
        const res = await getNotifications(user._id, {
        type: "unread",
        page: 1,
        limit: 10,
      });
        if (res.data.success) {
          setNotifications(res.data.data);
        }
      } catch (err) {
        showErrorToast("Error",err);
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
              {/* Notification Center */}
              <NotificationCenter
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
              />
              {/* User Menu */}
              {/* <Menu as="div" className="relative">
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
              </Menu> */}
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center cursor-pointer">
                  <img
                    src={user?.profilePictureUrl || "/default-avatar-profile-new-img.png"}
                    alt="avatar"
                    className="w-9 h-9 rounded-full border border-gray-300 shadow-sm object-cover"
                  />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="opacity-0 translate-y-2 scale-95"
                  enterTo="opacity-100 translate-y-0 scale-100"
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100 translate-y-0 scale-100"
                  leaveTo="opacity-0 translate-y-2 scale-95"
                >
                  <Menu.Items
                    className="
                      absolute right-0 mt-3 w-64 origin-top-right 
                      bg-white/80 dark:bg-gray-900/80 
                      backdrop-blur-xl 
                      rounded-2xl shadow-2xl ring-1 ring-black/5 
                      z-50 overflow-hidden
                    "
                  >

                    {/* Gradient Header */}
                    <div className="px-4 py-4 bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                      <div className="flex items-center space-x-3">
                        <Image
                          src={user?.profilePictureUrl || "/default-avatar-profile-new-img.png"}
                          alt="Profile Picture"
                          width={12}
                          height={12}
                          className="w-12 h-12 rounded-full border-2 border-white shadow-md"
                        />
                        <div>
                          <p className="text-base font-semibold">
                            {user?.name || "User Name"}
                          </p>
                          <p className="text-sm text-blue-100 truncate">
                            {user?.email}
                          </p>
                          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full mt-1 inline-block">
                            Admin
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* MENU ITEMS */}
                    <div className="py-2">

                      {/* Profile */}
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="/admin/profile"
                            className={`${
                              active ? "bg-gray-100 dark:bg-gray-800" : ""
                            } flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 transition`}
                          >
                            <UserCircleIcon className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-300" />
                            My Profile
                          </a>
                        )}
                      </Menu.Item>

                      {/* Settings */}
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="/admin/settings"
                            className={`${
                              active ? "bg-gray-100 dark:bg-gray-800" : ""
                            } flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 transition`}
                          >
                            <Cog6ToothIcon className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-300" />
                            Settings
                          </a>
                        )}
                      </Menu.Item>

                      {/* Divider */}
                      <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

                      {/* Help Center */}
                      {/* <Menu.Item>
                        {({ active }) => (
                          <a
                            href="/admin/help"
                            className={`${
                              active ? "bg-gray-100 dark:bg-gray-800" : ""
                            } flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 transition`}
                          >
                            <QuestionMarkCircleIcon className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-300" />
                            Help Center
                          </a>
                        )}
                      </Menu.Item> */}

                      {/* Logout */}
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={signOut}
                            className={`${
                              active ? "bg-red-50 dark:bg-gray-800 cursor-pointer" : ""
                            } flex w-full items-center px-4 py-3 text-sm text-red-600 dark:text-red-400 font-semibold transition cursor-pointer`}
                          >
                            <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-red-500 dark:text-red-400" />
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
    </>
  );
};
