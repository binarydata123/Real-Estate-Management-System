'use client';
import React from 'react';
import {
    Users,
    Building2,
    Home,
    BarChart4,
    ArrowUp,
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

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

// Mock Data
const stats = [
    { name: 'Total Users', stat: '1,204', icon: Users, change: '12%', changeType: 'increase' },
    { name: 'Total Agencies', stat: '73', icon: Building2, change: '2.5%', changeType: 'increase' },
    { name: 'Total Properties', stat: '5,816', icon: Home, change: '5.4%', changeType: 'increase' },
    { name: 'Pending Approvals', stat: '12', icon: BarChart4, change: '3.2%', changeType: 'decrease' },
];

const userGrowthData = [
    { name: 'Jan', users: 400 },
    { name: 'Feb', users: 300 },
    { name: 'Mar', users: 500 },
    { name: 'Apr', users: 780 },
    { name: 'May', users: 600 },
    { name: 'Jun', users: 800 },
];

const recentUsers = [
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', role: 'Agent', joined: '2 days ago' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', role: 'User', joined: '3 days ago' },
    { id: 3, name: 'Sam Wilson', email: 'sam.wilson@example.com', role: 'Agent', joined: '5 days ago' },
    { id: 4, name: 'Alice Johnson', email: 'alice.j@example.com', role: 'Admin', joined: '1 week ago' },
];

const recentAgencies = [
    { id: 1, name: 'Prestige Properties', location: 'New York, USA', agents: 15, joined: '1 week ago' },
    { id: 2, name: 'Sunset Realty', location: 'Los Angeles, USA', agents: 8, joined: '2 weeks ago' },
    { id: 3, name: 'Oceanview Homes', location: 'Miami, USA', agents: 12, joined: '3 weeks ago' },
];

export default function AdminDashboard() {
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
                beginAtZero: true
            }
        }
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
                label: 'Property Listings',
                data: userGrowthData.map(d => d.users * (Math.random() * 4 + 3)),
                fill: false,
                borderColor: 'rgb(136, 132, 216)',
                backgroundColor: 'rgba(136, 132, 216, 0.5)',
                tension: 0.1,
            },
        ],
    };

    return (
        <div className="p-4 md:p-6 lg:p-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Admin Dashboard</h1>

            {/* Stats Cards */}
            <div>
                <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((item) => (
                        <div key={item.name} className="relative overflow-hidden rounded-lg bg-white md:px-4 px-2 pt-5 pb-6 shadow sm:px-6 sm:pt-6">
                            <dt>
                                <div className="absolute rounded-md bg-blue-500 p-3">
                                    <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                                </div>
                                <p className="ml-16 truncate text-sm font-medium text-gray-500">{item.name}</p>
                            </dt>
                            <dd className="ml-16 flex items-baseline">
                                <p className="text-2xl font-semibold text-gray-900">{item.stat}</p>
                                <p
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
                                </p>
                            </dd>
                        </div>
                    ))}
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
                                    <tr key={user.id}>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">{user.name}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.role}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.joined}</td>
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
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Location</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Agents</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {recentAgencies.map((agency) => (
                                    <tr key={agency.id}>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">{agency.name}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{agency.location}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{agency.agents}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
