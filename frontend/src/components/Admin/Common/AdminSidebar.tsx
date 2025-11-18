"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart4, Settings, X, Building2, Users, UserCircle, House, UserCog } from "lucide-react";

const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: Home },
    { name: "Profile", href: "/admin/profile", icon: UserCog },
    { name: "Agencies", href: "/admin/agencies", icon: Building2 },
    { name: "Agents", href: "/admin/agents", icon: UserCircle },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Properties", href: "/admin/properties", icon: House },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart4 },
    // { name: "Users", href: "/admin/users", icon: Users },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

interface SidebarProps {
    onClose: () => void;
    isOpen: boolean;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();

    const isActive = (href: string) => pathname === href;

    return (
        <div
            className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:relative lg:translate-x-0 lg:flex
      `}
        >
            <div className="flex justify-between items-center border-b border-gray-200">
                {/* Admin Panel Branding */}
                <div className="flex items-center p-5">
                    <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-lg bg-gray-800 flex items-center justify-center text-white font-bold text-xl">
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

            {/* REAMS Branding */}
            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center justify-center text-gray-400">
                    <span className="text-xs font-medium">Powered by REAMS</span>
                </div>
            </div>
        </div>
    );
}
