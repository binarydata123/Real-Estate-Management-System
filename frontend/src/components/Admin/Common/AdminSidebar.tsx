"use client";

import React, { forwardRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart4, Settings, X, Building2, Users, House, UserCog, Layers, CalendarCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";

const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: Home },
    { name: "Agencies", href: "/admin/agencies", icon: Building2 },
    // { name: "Agents", href: "/admin/agents", icon: UserCircle },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Meetings", href: "/admin/meetings", icon: CalendarCheck },
    { name: "Properties", href: "/admin/properties", icon: House },
    { name: "Shared Properties", href: "/admin/shared-properties", icon: Layers },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart4 },
    { name: "Profile", href: "/admin/profile", icon: UserCog },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

interface SidebarProps {
    onClose: () => void;
    isOpen: boolean;
}

export const AdminSidebar = forwardRef<HTMLDivElement, SidebarProps>(({ isOpen, onClose }, ref) => {
    const pathname = usePathname();
    const { signOut } = useAuth();

    const isActive = (href: string) => pathname === href;

    return (
        <div
        ref={ref}
            className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:relative lg:translate-x-0 lg:flex
      `}
        >
            <div className="flex justify-between items-center border-b border-gray-200">
                {/* Admin Panel Branding */}
                <div className="flex items-center p-2">
                    <div className="flex items-center space-x-3">
                        <div className="md:h-10 md:w-10 w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold bg-primary">
                            A
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-900">Admin Panel</h2>
                            <p className="text-sm text-gray-500">REAMS</p>
                        </div>
                    </div>
                </div>

                {/* Close button for mobile */}
                <div className="flex justify-end p-4 lg:hidden">
                    <button
                        type="button"
                        className="-m-2.5 p-2.5 rounded-md text-gray-700 lg:hidden"
                        onClick={onClose}
                    >
                        <span className="sr-only">Close sidebar</span>
                        <X className="h-6 w-6" aria-hidden="true" />
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 md:px-3 px-1 py-2 md:py-4 space-y-1">
                {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={onClose}
                            className={`
                flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                ${isActive(item.href)
                                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }
              `}
                        >
                            <Icon className="mr-3 h-5 w-5" />
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
});
AdminSidebar.displayName = "AdminSidebar"