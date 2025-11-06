'use client';
import React, { useState } from 'react';
//import { Menu } from 'lucide-react';
import AdminSidebar from '@/components/Admin/Common/AdminSidebar';
import { Header } from '@/components/Admin/Common/Header';

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-100">
            <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header onMenuButtonClick={() => setSidebarOpen(true)}/>
                {/* <header className="flex justify-between items-center p-4 bg-white border-b lg:hidden">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-gray-500 focus:outline-none lg:hidden"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <h1 className="text-xl font-semibold">Admin Panel sdfsd</h1>
                </header> */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
                    {children}
                </main>
            </div>
        </div>
    );
};