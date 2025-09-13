'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, Home, DollarSign, Activity, TrendingUp, UserPlus, Star } from 'lucide-react';

// --- Mock Data (replace with your actual data fetching) ---
const monthlySignups = [
    { name: 'Jan', signups: 40 },
    { name: 'Feb', signups: 30 },
    { name: 'Mar', signups: 50 },
    { name: 'Apr', signups: 45 },
    { name: 'May', signups: 60 },
    { name: 'Jun', signups: 70 },
];

const revenueData = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 5000 },
    { name: 'Apr', revenue: 4500 },
    { name: 'May', revenue: 6000 },
    { name: 'Jun', revenue: 7500 },
];

const recentActivities = [
    { id: 1, user: 'Alice Johnson', action: 'listed a new property', time: '2h ago', icon: Home },
    { id: 2, user: 'Bob Williams', action: 'closed a deal', time: '5h ago', icon: DollarSign },
    { id: 3, user: 'Charlie Brown', action: 'joined the platform', time: '1d ago', icon: UserPlus },
    { id: 4, user: 'Diana Prince', action: 'updated her profile', time: '2d ago', icon: Activity },
];

const topAgents = [
    { id: 1, name: 'John Doe', deals: 12, avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { id: 2, name: 'Jane Smith', deals: 9, avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { id: 3, name: 'Sam Wilson', deals: 7, avatar: 'https://randomuser.me/api/portraits/men/34.jpg' },
];

// --- Reusable Components ---

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ElementType;
    change: string;
    changeType: 'increase' | 'decrease';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, change, changeType }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center justify-between transition-all hover:shadow-xl hover:-translate-y-1">
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            <div className={`text-xs flex items-center mt-1 ${changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>{change} vs last month</span>
            </div>
        </div>
        <div className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded-full p-3">
            <Icon className="w-6 h-6" />
        </div>
    </div>
);

export default function Analytics() {
    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 dark:bg-gray-900 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Admin Analytics Dashboard</h1>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard title="Total Users" value="1,254" icon={Users} change="+12.5%" changeType="increase" />
                <StatCard title="Properties Listed" value="3,480" icon={Home} change="+8.2%" changeType="increase" />
                <StatCard title="Total Revenue" value="$89,450" icon={DollarSign} change="-1.4%" changeType="decrease" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Monthly Signups Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <UserPlus className="w-5 h-5 mr-2" />
                        Monthly Sign-ups
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlySignups}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: 'rgba(128, 128, 128, 0.5)' }} />
                            <Legend />
                            <Bar dataKey="signups" fill="#3B82F6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Revenue Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <DollarSign className="w-5 h-5 mr-2" />
                        Revenue Over Time
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: 'rgba(128, 128, 128, 0.5)' }} />
                            <Legend />
                            <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Activity and Top Agents */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <Activity className="w-5 h-5 mr-2" />
                        Recent Activity
                    </h2>
                    <ul className="space-y-4">
                        {recentActivities.map(activity => (
                            <li key={activity.id} className="flex items-center">
                                <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-2 mr-4">
                                    <activity.icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-800 dark:text-gray-200">
                                        <span className="font-semibold">{activity.user}</span> {activity.action}.
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Top Performing Agents */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <Star className="w-5 h-5 mr-2" />
                        Top Performing Agents
                    </h2>
                    <ul className="space-y-4">
                        {topAgents.map(agent => (
                            <li key={agent.id} className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <img className="w-10 h-10 rounded-full object-cover mr-4" src={agent.avatar} alt={agent.name} />
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">{agent.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{agent.deals} deals closed</p>
                                    </div>
                                </div>
                                <div className="text-yellow-500">
                                    <Star className="w-5 h-5 fill-current" />
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}