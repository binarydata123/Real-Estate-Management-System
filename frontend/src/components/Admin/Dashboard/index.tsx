'use client';
import React, { useEffect, useState } from 'react';
import { getAllDashboardData } from "@/lib/Admin/DashboardAPI";
import {
    Users,
    Building2,
    Home,
    BarChart4,
    //ArrowUp,
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { showErrorToast } from '@/utils/toastHandler';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
);

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats[]>([]);
    const [userGrowthData, setUserGrowthData] = useState<UserGrowthData[]>([]);
    const [propertyGrowthData, setPropertyGrowthData] = useState<PropertyGrowthData[]>([]);
    const [recentUsers, setRecentUsers] = useState<RecentUserData[]>([]);
    const [recentAgencies, setRecentAgencies] = useState<AgencyData[]>([]);
    useEffect(() => {
        async function fetchData() {
            try {
                const res = await getAllDashboardData(); // your API route
                if (res.success) {
                    setStats(res.data.stats);
                    setUserGrowthData(res.data.userGrowthData);
                    setPropertyGrowthData(res.data.propertyGrowthData);
                    setRecentUsers(res.data.recentUsers);
                    setRecentAgencies(res.data.recentAgencies);
                }
            } catch (err) {
                showErrorToast("Error:",err);
            }
        }
        fetchData();
    }, []);
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    const labels = userGrowthData.map(d => d.name);

    const barChartData = {
        labels,
        datasets: [
            {
                label: 'New Users',
                data: userGrowthData.map(d => d.users),
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1,
            },
        ],
    };

    const lineChartData = {
        labels,
        datasets: [
        {
            label: "Property Listings",
            data: propertyGrowthData.map(d => d.properties),
            fill: false,
            borderColor: "rgb(136, 132, 216)",
            backgroundColor: "rgba(136, 132, 216, 0.5)",
            tension: 0.1,
        },
        ],
    };

    return (
        <div className="p-4 md:p-6 lg:p-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Admin Dashboard</h1>

            {/* Stats Cards */}
            <div>
                <dl className="grid grid-cols-2 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((item, index) => {
                        const icons = [Users, Building2, Home, BarChart4];
                        const Icon = icons[index] || Users;
                        return (
                            <div key={item.name} className="relative dashboard-tab-sec-padding overflow-hidden rounded-lg bg-white md:px-4 px-2 pt-5 pb-6 shadow sm:px-6 sm:pt-6">
                                <dt>
                                    <div className="absolute rounded-md bg-blue-500 p-3">
                                        <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                                    </div>
                                    <p className="ml-16 text-sec-margin truncate text-sm font-medium text-gray-500">{item.name}</p>
                                </dt>
                                <dd className="ml-16 text-sec-margin flex items-baseline">
                                    <p className="text-2xl font-semibold text-gray-900">{item.stat}</p>
                                    {/* <p
                                        className={`ml-2 flex items-baseline text-sm font-semibold ${item.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                                            }`}
                                    >
                                        <ArrowUp
                                            className={`h-5 w-5 flex-shrink-0 self-center ${item.changeType === 'increase' ? '' : 'rotate-180'
                                                }`}
                                            aria-hidden="true"
                                        />
                                        <span className="sr-only"> {item.changeType === 'increase' ? 'Increased' : 'Decreased'} by </span>
                                        {item.change}
                                    </p> */}
                                </dd>
                            </div>
                        );
                    })}
                </dl>
            </div>

            {/* Charts */}
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* User Growth Chart */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">User Growth</h3>
                    <div className="mt-4 h-72">
                        <Bar options={chartOptions} data={barChartData} />
                    </div>
                </div>

                {/* Property Listings Chart */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Property Listings</h3>
                    <div className="mt-4 h-72">
                        <Line options={chartOptions} data={lineChartData} />
                    </div>
                </div>
            </div>

            {/* Recent Activity Tables */}
            <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
                {/* Recent Users */}
                <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Users</h3>
                    <div className="mt-4">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead>
                                <tr>
                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Name</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Role</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {recentUsers.map((user) => (
                                    <tr key={user._id}>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">{user.name}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.role}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Agencies */}
                <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Agencies</h3>
                    <div className="mt-4">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead>
                                <tr>
                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Agency Name</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Phone</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {recentAgencies.map((agency) => (
                                    <tr key={agency._id}>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">{agency.name}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{agency.email}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{agency.phone}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
