'use client';
import React, { useState } from 'react';
import { MoreVertical, Search, PlusCircle, Building2, CheckCircle, Clock, XCircle } from 'lucide-react';
import AddAgencyModal from './AddAgencyModal';

// Mock data - in a real app, you'd fetch this from your API
const agencies = [
    {
        id: '1',
        name: 'Prestige Properties',
        logo_url: 'https://tailwindui.com/img/logos/48x48/tuple.svg',
        members: 15,
        properties: 120,
        status: 'approved',
        joined: '2023-01-15',
    },
    {
        id: '2',
        name: 'Sunset Realty',
        logo_url: 'https://tailwindui.com/img/logos/48x48/savvycal.svg',
        members: 8,
        properties: 75,
        status: 'approved',
        joined: '2023-02-20',
    },
    {
        id: '3',
        name: 'Oceanview Homes',
        logo_url: 'https://tailwindui.com/img/logos/48x48/reform.svg',
        members: 12,
        properties: 95,
        status: 'pending',
        joined: '2023-03-10',
    },
    {
        id: '4',
        name: 'Mountain Top Estates',
        logo_url: 'https://tailwindui.com/img/logos/48x48/statamic.svg',
        members: 5,
        properties: 30,
        status: 'rejected',
        joined: '2023-04-05',
    },
    {
        id: '5',
        name: 'Cityscape Real Estate',
        logo_url: 'https://tailwindui.com/img/logos/48x48/transistor.svg',
        members: 22,
        properties: 250,
        status: 'approved',
        joined: '2022-11-28',
    },
];

const statusStyles: { [key: string]: string } = {
    approved: 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400',
};

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

export default function Agencies() {
    // State to control the Add Agency modal
    const [isAddAgencyModalOpen, setAddAgencyModalOpen] = useState(false);

    // Calculate stats from mock data
    const totalAgencies = agencies.length;
    const approvedAgencies = agencies.filter(a => a.status === 'approved').length;
    const pendingAgencies = agencies.filter(a => a.status === 'pending').length;
    const rejectedAgencies = agencies.filter(a => a.status === 'rejected').length;

    const agencyStats = [
        { name: 'Total Agencies', value: totalAgencies, icon: Building2, color: 'bg-blue-500' },
        { name: 'Approved', value: approvedAgencies, icon: CheckCircle, color: 'bg-green-500' },
        { name: 'Pending', value: pendingAgencies, icon: Clock, color: 'bg-yellow-500' },
        { name: 'Rejected', value: rejectedAgencies, icon: XCircle, color: 'bg-red-500' },
    ];

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="sm:flex sm:items-center sm:justify-between sm:gap-4">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Agencies</h1>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                        A list of all the agencies in the system including their name, members, and status.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 sm:flex-none">
                    <button
                        type="button"
                        onClick={() => setAddAgencyModalOpen(true)}
                        className="inline-flex items-center justify-center rounded-md   bg-blue-600 md:px-4 px-2 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
                    >
                        <PlusCircle className="-ml-1 mr-2 h-5 w-5" />
                        Add Agency
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="mt-8">
                <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {agencyStats.map((item) => (
                        <div
                            key={item.name}
                            className="relative overflow-hidden rounded-lg bg-white shadow p-2"
                        >
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className={classNames(item.color, "rounded-lg p-3")}>
                                            <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                                        </div>
                                    </div>
                                    <div className="ml-4 w-0 flex-1">
                                        <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">{item.name}</dt>
                                        <dd>
                                            <div className="flex items-baseline">
                                                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{item.value}</p>
                                            </div>
                                        </dd>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </dl>
            </div>

            {/* Search and Filter */}
            <div className="mt-8 sm:flex sm:items-center sm:gap-x-4">
                <div className="flex-1">
                    <label htmlFor="search" className="sr-only">Search</label>
                    <div className="relative rounded-md shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                            type="text"
                            name="search"
                            id="search"
                            className="w-full md:px-4 px-2 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Search agencies..."
                        />
                    </div>
                </div>
                <div className="mt-4 sm:mt-0 sm:w-auto">
                    <label htmlFor="status" className="sr-only">Status</label>
                    <select id="status" name="status" className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500" defaultValue="All Statuses">
                        <option>All Statuses</option>
                        <option>Approved</option>
                        <option>Pending</option>
                        <option>Rejected</option>
                    </select>
                </div>
            </div>

            <div className="mt-8 flex flex-col">
                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <div className="overflow-hidden shadow-sm  md:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300 ">
                                <thead className="bg-gray-50  dark:bg-gray-800">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 dark:text-gray-300">Agency</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-300">Members</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-300">Properties</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-300">Status</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-300">Joined</th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white dark:bg-gray-900 dark:divide-gray-700">
                                    {agencies.map((agency) => (
                                        <tr key={agency.id}>
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0"><img className="h-10 w-10 rounded-full" src={agency.logo_url} alt={`${agency.name} logo`} /></div>
                                                    <div className="ml-4"><div className="font-medium text-gray-900 dark:text-white">{agency.name}</div></div>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{agency.members}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{agency.properties}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                <span className={classNames(statusStyles[agency.status], 'inline-flex capitalize items-center rounded-full px-2.5 py-0.5 text-xs font-medium')}>
                                                    {agency.status.charAt(0).toUpperCase() + agency.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{new Date(agency.joined).toLocaleDateString()}</td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <button className="text-gray-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400"><span className="sr-only">Actions for {agency.name}</span><MoreVertical className="h-5 w-5" /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Agency Modal */}
            <AddAgencyModal isOpen={isAddAgencyModalOpen} onClose={() => setAddAgencyModalOpen(false)} />
        </div>
    );
}
