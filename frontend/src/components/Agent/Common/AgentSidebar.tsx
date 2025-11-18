"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  BuildingOfficeIcon,
  UsersIcon,
  CalendarIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/context/AuthContext";
import { Bell } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/agent/dashboard", icon: HomeIcon },
  { name: "Properties", href: "/agent/properties", icon: BuildingOfficeIcon },
  { name: "Customers", href: "/agent/customers", icon: UsersIcon },
  { name: "Meetings", href: "/agent/meetings", icon: CalendarIcon },
  { name: "Messages", href: "/agent/messages", icon: CalendarIcon },
  { name: "Shares", href: "/agent/shares", icon: ChartBarIcon },
  { name: "Analytics", href: "/agent/analytics", icon: ChartBarIcon },
  { name: "Notifications", href: "/agent/notifications", icon: Bell },
  { name: "Settings", href: "/agent/settings", icon: Cog6ToothIcon },
  // { name: "Profile", href: "/agent/profile", icon: UsersIcon },
  { name: "Team Management", href: "/agent/team-members", icon: UsersIcon },
];

interface SidebarProps {
  onClose: () => void;
  isOpen: boolean;
}

export const AgentSidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { signOut, user } = useAuth();
  const pathname = usePathname();

  return (
    <div
      className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:relative lg:translate-x-0 lg:flex
      `}
    >
      <div className="flex justify-between items-center border-b border-gray-200">
        {/* Agency Branding */}
        <div className="md:p-5 p-2">
          {user ? (
            <div className="flex items-center space-x-3">
              {user?.agency?.logoUrl ? (
                <Image
                  src={user?.agency?.logoUrl || ""}
                  alt={user.agency.name}
                  className="h-10 w-10 rounded-lg object-cover"
                  width={40}
                  height={40}
                />
              ) : (
                <div
                  className="md:h-10 md:w-10 w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: "#2563eb" }}
                >
                  {user.agency?.name.charAt(0)}
                </div>
              )}
              <div>
                <h2 className="font-semibold text-gray-900">
                  {user.agency?.name}
                </h2>
                <p className="text-sm text-gray-500">Real Estate Agency</p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-gray-500">No agency selected</p>
            </div>
          )}
        </div>

        {/* Close button for mobile */}
        <div className="flex justify-end p-4 lg:hidden">
          <button
            type="button"
            className="-m-2.5 p-2.5 rounded-md text-gray-700 lg:hidden"
            onClick={onClose}
          >
            <span className="sr-only">Close sidebar</span>
            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 md:px-3 px-1 py-2 md:py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon className="mr-3 h-5 w-5" aria-hidden="true" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="md:px-3 md:py-4 border-t border-gray-200 text-center mx-auto w-full">
        <button
          onClick={() => signOut()}
          className="flex w-full justify-center text-red-500 items-center px-2 py-2 text-sm font-medium rounded-lg  hover:bg-red-50 hover:text-red-700 transition-colors"
        >
          <ArrowRightOnRectangleIcon
            className="mr-1 h-5 w-5"
            aria-hidden="true"
          />
          Sign Out
        </button>
      </div>
    </div>
  );
};
