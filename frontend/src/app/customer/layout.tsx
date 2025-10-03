'use client'
import { CustomerHeader } from '@/components/Customer/Common/CustomerHeader';
import { CustomerSidebar } from '@/components/Customer/Common/CustomerSidebar';
import { useAuth } from '@/context/AuthContext';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { Calendar, CalendarIcon, LayoutDashboard, Loader, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';


interface LayoutProps {
    children: React.ReactNode;
}

export default function CustomerLayout({ children }: LayoutProps) {
    const { loading } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

    const footerLinks = [
        {
            id: "dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
            path: "/customer/dashboard",
        },

        {
            id: "properties",
            label: "Properties",
            icon: BuildingOfficeIcon,
            path: "/customer/properties",
        },
        {
            id: "customers",
            label: "Customers",
            icon: Calendar,
            path: "/customer/customers",
        },
        {
            id: "meetings",
            label: "Meetings",
            icon: CalendarIcon,
            path: "/customer/meetings",
        },
        {
            id: "more",
            label: "More",
            icon: MoreVertical,
            path: ''
        }
    ];

    const handleMoreClick = () => {
        setIsSidebarOpen(!isSidebarOpen)
    };


    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className={`lg:hidden fixed inset-y-0 left-0 z-30 max-w-72 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                        } transition-transform duration-300 ease-in-out`}
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar (Desktop always visible, Mobile toggled) */}
            <CustomerSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="flex-1 flex flex-col">
                <CustomerHeader onMenuButtonClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 p-2 md:p-6 mb-12">
                    {children}
                </main>
                {/* Footer Links */}
                <div className="fixed bottom-0 left-0 w-full   py-2 md:hidden" style={{ backgroundColor: "#2563eb" }}>
                    <div className="grid grid-cols-5 gap-2 text-white">
                        {footerLinks
                            .map((link) =>
                                link.id === "more" ? (
                                    <div
                                        key={link.id}
                                        onClick={() => handleMoreClick()} // 👈 your custom function
                                        className="flex flex-col items-center text-xs hover:text-white transition-colors w-full"
                                    >
                                        <link.icon className="w-5 h-5 mb-1" />
                                        <span>{link.label}</span>
                                    </div>
                                ) : (
                                    <Link
                                        key={link.id}
                                        href={link.path}
                                        className={`flex flex-col items-center text-xs hover:text-white transition-colors ${link.id === 'dashboard' ? 'ml-3' : ''}`}
                                    >
                                        <link.icon className="w-5 h-5 mb-1" />
                                        <span>{link.label}</span>
                                    </Link>
                                )
                            )}
                    </div>
                </div>

            </div>
        </div>
    );
}
