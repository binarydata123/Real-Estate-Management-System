'use client';
import React, { useEffect, useRef, useState } from 'react';
import { AdminSidebar } from '@/components/Admin/Common/AdminSidebar';
import { Header } from '@/components/Admin/Common/Header';
import { Calendar, CalendarIcon, LayoutDashboard, MoreVertical, Loader } from 'lucide-react';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { usePathname } from 'next/navigation';
import Link from "next/link";
import { useAuth } from '@/context/AuthContext';

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    const pathname = usePathname();
    const sideBarRef = useRef<HTMLDivElement>(null);
    const { loading } = useAuth();

    const footerLinks = [
        {
            id: "dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
            path: "/admin/dashboard",
        },

        {
            id: "properties",
            label: "Properties",
            icon: BuildingOfficeIcon,
            path: "/admin/properties",
        },
        {
            id: "customers",
            label: "Customers",
            icon: Calendar,
            path: "/admin/customers",
        },
        {
            id: "meetings",
            label: "Meetings",
            icon: CalendarIcon,
            path: "/admin/meetings",
        },
        {
            id: "more",
            label: "More",
            icon: MoreVertical,
            path: "",
        },
    ];

    const handleMoreClick = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleMouseDownEvent = (e: MouseEvent) => {
        if (sideBarRef.current && !sideBarRef.current.contains(e.target as Node)) {
            setIsSidebarOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleMouseDownEvent);
        return () => {
            document.removeEventListener("mousedown", handleMouseDownEvent);
        };
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader className="w-8 h-8 text-primary animate-spin" />
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
            <AdminSidebar isOpen={isSidebarOpen} ref={sideBarRef} onClose={() => {
                setIsSidebarOpen(false);
            }} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header onMenuButtonClick={() => setIsSidebarOpen(true)} />

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 mb-12">
                    {children}
                </main>
                {/* Footer Links */}
                <div className="fixed bottom-0 left-0 w-full h-[50px] md:hidden bg-primary">
                    <div className="grid grid-cols-5 h-[100%] gap-2 text-white">
                        {footerLinks.map((link) =>
                            link.id === "more" ? (
                                <div
                                    key={link.id}
                                    onClick={() => handleMoreClick()}
                                    className={`h-[100%] justify-center flex flex-col items-center text-xs transition-colors cursor-pointer ${!pathname.startsWith("/admin/dashboard") &&
                                        !pathname.startsWith("/admin/properties") &&
                                        !pathname.startsWith("/admin/customers") &&
                                        !pathname.startsWith("/admin/meetings")
                                        ? "bg-white text-primary"
                                        : ""
                                        }`}
                                >
                                    <link.icon className="w-5 h-5 mb-1" />
                                    <span>{link.label}</span>
                                </div>
                            ) : (
                                <Link
                                    key={link.id}
                                    href={link.path}
                                    className={`h-[100%] justify-center flex flex-col items-center text-xs transition-colors
                   ${pathname.startsWith(link.path)
                                            ? "bg-white text-primary"
                                            : ""
                                        }`}
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
