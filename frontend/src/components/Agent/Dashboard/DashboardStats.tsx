'use client';

import React from 'react';
import {
    BuildingOfficeIcon,
    UsersIcon,
    CalendarIcon,
    CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ElementType;
    color: string;
    trend?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200 p-2 md:p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <p className="text-3xl font-bold text-gray-900 md:mt-2">{value}</p>
                {trend && <p className={`text-sm mt-1 ${color}`}>{trend}</p>}
            </div>
            <div
                className={`p-2 md:p-3 rounded-lg ${color
                    .replace('text', 'bg')
                    .replace('-600', '-100')}`}
            >
                <Icon className={`h-6 w-6 ${color}`} />
            </div>
        </div>
    </div>
);

export const DashboardStats: React.FC = () => {
    const stats = [
        {
            title: 'Active Properties',
            value: '12',
            icon: BuildingOfficeIcon,
            color: 'text-blue-600',
            // trend: '+2 this week',
        },
        {
            title: 'Total Customers',
            value: '34',
            icon: UsersIcon,
            color: 'text-green-600',
            // trend: '+5 this month',
        },
        {
            title: 'Meetings This Week',
            value: '8',
            icon: CalendarIcon,
            color: 'text-purple-600',
            // trend: '3 today',
        },
        {
            title: 'Total Revenue',
            value: '₹2.4M',
            icon: CurrencyDollarIcon,
            color: 'text-emerald-600',
            // trend: '+12% vs last month',
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6 mb-2 md:mb-8">
            {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
            ))}
        </div>
    );
};

export default DashboardStats;
