"use client";
import React, { Fragment, useEffect, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import Link from "next/link";
import {
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/context/AuthContext";
import { NotificationCenter } from "./NotificationHeaderModal";
import InstallButton from "@/components/Common/InstallButton";
import { getUnreadNotificationsCount } from "@/lib/Common/Notifications";
import { showErrorToast } from "@/utils/toastHandler";
import { getInitial } from "@/helper/getInitialForProfile";

interface HeaderProps {
  onMenuButtonClick: () => void;
}

export const AgentHeader: React.FC<HeaderProps> = ({ onMenuButtonClick }) => {
  const { user, signOut } = useAuth();
  const [showNotifications, setShowNotifications] =
    React.useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState(0);
  useEffect(() => {
    fetchUnreadCount();
  }, []);
  const fetchUnreadCount = async () => {
    try {
      if (!user?._id) return;
      const res = await getUnreadNotificationsCount();
      setUnreadCount(res.data);
    } catch (err) {
      showErrorToast("Error", err);
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="md:px-6 md:py-4 py-1">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <div className="flex gap-1 items-center">
              <button
                type="button"
                className="hidden p-2 text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-primary"
                onClick={onMenuButtonClick}
              >
                <span className="sr-only">Open sidebar</span>
                <Bars3Icon className="h-5 w-5 header-icon" aria-hidden="true" />
              </button>
              {/* Page Title */}
              <div className="pl-2">
                <h1 className="text-2xl font-bold text-gray-900">REAMS</h1>
                <p className="text-sm text-gray-500 hidden md:block">
                  Real Estate Management System
                </p>
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-1 md:space-x-4">
              <InstallButton />
              {/* Notifications */}
              <span
                onClick={() => setShowNotifications(true)}
                className="relative p-2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                aria-label="View notifications"
              >
                <span className="sr-only">View notifications</span>
                <BellIcon className="md:h-6 md:w-6 w-5 h-5 header-icon" />
                {unreadCount > 0 && (
                  <span
                    className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"
                    aria-hidden="true"
                  ></span>
                )}
              </span>

              {/* User Menu */}
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-1 focus:ring-primary">
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                    {getInitial(user?.name)}
                  </div>
                </Menu.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-150"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-3 w-64 bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden z-50">
                    {/* User Info Section */}
                    <div className="px-4 py-4 bg-gray-50 border-b border-gray-100">
                      <p className="text-base font-semibold text-gray-900 truncate">
                        {user?.name || "User"}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {user?.email}
                      </p>
                    </div>

                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href="/agent/profile"
                            className={`${active ? "bg-gray-100" : ""
                              } flex items-center px-4 py-3 text-sm text-gray-700 transition`}
                          >
                            <UserCircleIcon className="mr-3 h-5 w-5 text-gray-500" />
                            Account Profile
                          </Link>
                        )}
                      </Menu.Item>

                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href={"#"}
                            onClick={signOut}
                            className={`${active ? "bg-red-50" : ""
                              } flex  items-center px-4 py-3 text-sm text-red-600 font-medium transition`}
                          >
                            <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-red-500" />
                            Log Out
                          </Link>
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
        onClose={() => {
          setShowNotifications(false);
          fetchUnreadCount();
        }}
      />
    </>
  );
};
