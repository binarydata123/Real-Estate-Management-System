'use client';
import React, { useState } from 'react';
import AdminSidebar from '@/components/Admin/Common/AdminSidebar';
import { Header } from '@/components/Admin/Common/Header';

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout( { children }: LayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-100">
            <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header onMenuButtonClick={() => setSidebarOpen(true)}/>
               
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
                    {children}
                </main>
            </div>
        </div>
    );
}
