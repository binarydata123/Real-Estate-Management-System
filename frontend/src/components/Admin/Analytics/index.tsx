'use client';
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import {
    Users,
    Home,
    Activity,
    UserPlus,
    Star,
    Building2,
    Layers,
} from 'lucide-react';
import Image from 'next/image';
import { getAllAnalyticsData } from "@/lib/Admin/AnalyticsAPI";
import { showErrorToast } from '@/utils/toastHandler';

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ElementType;
    color: 'blue' | 'green' | 'purple' | 'red' | 'yellow';
}

const colorVariants = {
    blue: {
        border: 'border-blue-500',
        bg: 'bg-blue-500',
        darkBg: 'dark:bg-indigo-600',
    },
    green: {
        border: 'border-green-500',
        bg: 'bg-green-500',
        darkBg: 'dark:bg-green-600',
    },
    purple: {
        border: 'border-purple-500',
        bg: 'bg-purple-500',
        darkBg: 'dark:bg-purple-600',
    },
    red: {
        border: 'border-red-500',
        bg: 'bg-red-500',
        darkBg: 'dark:bg-red-600',
    },
    yellow: {
        border: 'border-yellow-500',
        bg: 'bg-yellow-500',
        darkBg: 'dark:bg-yellow-600',
    },
};

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color }) => {
    const variants = colorVariants[color];
    return (
        <div key={title} className={`flex justify-between items-center rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300 p-2 border-t-4 ${variants.border} group`}>
            <div className="">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
            <div className={`${variants.bg} ${variants.darkBg} rounded-full p-3 shadow-lg group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>
    );
};

const AnalyticsSkeleton = () => (
    <div className="p-2 sm:p-6 lg:p-8 bg-gray-100 dark:bg-gray-900 min-h-screen animate-pulse">
        <div className="h-9 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-3"></div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-3">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
            ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-80 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
            <div className="h-80 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
        </div>
    </div>
)

export default function Analytics() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<AnalyticsStats | null>(null);
    const [monthlySignUps, setMonthlySignUps] = useState<FormattedMonthlyUsers[]>([]);
    const [topAgents, setTopAgents] = useState<AnalyticsTopAgents[]>([]);
    const [recentActivities, setRecentActivities] = useState<AnalyticsRecentActivities[]>([]);
    const [monthlyCustomers, setMonthlyCustomers] = useState<FormattedMonthlyCustomers[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getAllAnalyticsData();
                if (res.success) {
                    setStats(res.data.stats);
                    const formattedUsers = res.data.monthlyUsers.map((item: AnalyticsMonthlyUsers) => ({
                        name: new Date(2025, item._id - 1).toLocaleString('default', { month: 'short' }),
                        signUps: item.count || 0,
                    }));
                    const formattedCustomers = res.data.monthlyCustomers.map((item: AnalyticsMonthlyUsers) => ({
                        name: new Date(2025, item._id - 1).toLocaleString('default', { month: 'short' }),
                        customers: item.count || 0,
                    }));
                    setMonthlySignUps(formattedUsers);
                    setTopAgents(res.data.topAgents);
                    setMonthlyCustomers(formattedCustomers);
                    setRecentActivities(res.data.recentActivities);
                }
            } catch (error) {
                showErrorToast('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <AnalyticsSkeleton />;
    }

    const iconsMap: Record<string, React.ElementType> = {
        HOME: Home,
        USER: UserPlus,
        MEETING: Activity,
    };

    return (
        <div className="p-2 sm:p-6 lg:p-8 bg-gray-100 dark:bg-gray-900 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Admin Analytics Dashboard</h1>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-3">
                <StatCard title="Total Users" value={stats?.totalUsers?.toString() || '0'} icon={Users} color="blue" />
                <StatCard title="Agencies" value={stats?.totalAgencies?.toString() || '0'} icon={Building2} color="blue" />
                <StatCard title="Customers" value={stats?.totalCustomers?.toString() || '0'} icon={UserPlus} color="blue" />
                <StatCard title="Properties" value={stats?.totalProperties?.toString() || '0'} icon={Home} color="blue" />
                <StatCard title="Meetings" value={stats?.totalSharedProperties?.toString() || '0'} icon={Activity} color="blue" />
                <StatCard title="Shared Properties" value={stats?.totalMeetings?.toString() || '0'} icon={Layers} color="blue" />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Monthly Sign-ups Chart */}
                <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-md">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 flex items-center">
                        <UserPlus className="w-5 h-5 mr-2" />
                        Monthly Sign-ups
                    </h2>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={monthlySignUps}>
                            <defs>
                                <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.2} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.1)" />
                            <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(10, 20, 30, 0.8)',
                                    borderColor: 'rgba(128, 128, 128, 0.2)',
                                    color: '#ffffff',
                                    borderRadius: '0.5rem'
                                }}
                                cursor={{ fill: 'rgba(156, 163, 175, 0.1)' }}
                            />
                            <Legend />
                            <Bar dataKey="signUps" name="Sign-ups" fill="url(#colorSignups)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>

                </div>

                {/* Monthly New Customers Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <Users className="w-5 h-5 mr-2" />
                        Monthly New Customers
                    </h2>
                    <ResponsiveContainer width="100%" height={350}>
                        <AreaChart data={monthlyCustomers}>
                            <defs>
                                <linearGradient id="colorCustomers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.1)" />
                            <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(10, 20, 30, 0.8)',
                                    borderColor: 'rgba(128, 128, 128, 0.2)',
                                    color: '#ffffff',
                                    borderRadius: '0.5rem'
                                }}
                                cursor={{ fill: 'rgba(156, 163, 175, 0.1)' }}
                            />
                            <Legend />
                            <Area type="monotone" dataKey="customers" name="Customers" stroke="#10B981" fill="url(#colorCustomers)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-md">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 flex items-center">
                        <Activity className="w-5 h-5 mr-2" />
                        Recent Activity
                    </h2>
                    <ul className="space-y-1">
                        {recentActivities.map((activity, index) => {
                            const Icon = iconsMap[activity.icon.toUpperCase()] || Activity;
                            return (
                                <li key={`${activity.id}-${index}`} className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
                                    <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-2.5 mr-4">
                                        <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-800 dark:text-gray-200">
                                            <span className="font-semibold">{activity.user}</span> {activity.action}.
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>

            <div className="mt-3">
                {/* Top Performing Agents */}
                <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-md">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 flex items-center">
                        <Star className="w-5 h-5 mr-2" />
                        Top Performing Agents
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {topAgents.map(agent => (
                            <div key={agent.id} className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="flex items-center">
                                    <Image
                                        width={50}
                                        height={50}
                                        className="w-10 h-10 rounded-full object-cover mr-4"
                                        src={agent.profilePictureUrl || '/default-avatar-profile-new-img.png'}
                                        alt={agent.name}
                                    />
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">{agent.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{agent.deals} deals closed</p>
                                    </div>
                                </div>
                                <div className="text-yellow-500">
                                    <Star className="w-5 h-5 fill-current ml-auto" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
