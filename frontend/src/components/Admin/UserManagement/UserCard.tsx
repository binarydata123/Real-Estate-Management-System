'use client';
import React from 'react';
import { Edit, Eye, Trash2, Mail, Briefcase, BarChart2 } from 'lucide-react';

// A more comprehensive user type based on Supabase auth and your DB schema
export interface UserProfile {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
    email: string;
    role: 'super_admin' | 'agency_admin' | 'agent' | 'customer';
    status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'active'; // Assuming 'active' is a possible status
    lastSignIn?: string;
    // Example stats - you would fetch this data from your backend
    stats?: {
        propertiesListed: number;
        dealsClosed: number;
        clientsManaged: number;
    };
}

interface UserCardProps {
    user: UserProfile;
    onEdit: (user: UserProfile) => void;
    onDelete: (user: UserProfile) => void;
    onViewProfile: (user: UserProfile) => void;
}

const roleColors: Record<UserProfile['role'], string> = {
    super_admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    agency_admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    agent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    customer: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
};

const statusColors: Record<UserProfile['status'], string> = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    accepted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    expired: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

const StatCard: React.FC<{ icon: React.ElementType; label: string; value: number | string }> = ({ icon: Icon, label, value }) => (
    <div className="flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
        <Icon className="w-6 h-6 mb-1 text-gray-500 dark:text-gray-400" />
        <span className="text-sm font-semibold text-gray-800 dark:text-white">{value}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
    </div>
);


export default function UserCard({ user, onEdit, onDelete, onViewProfile }: UserCardProps) {
    const { fullName, avatarUrl, email, role, status, stats } = user;

    const formattedRole = role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1);

    return (
        <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700 transform hover:scale-105 transition-transform duration-300">
            <div className="flex flex-col items-center p-6">
                <img
                    className="w-24 h-24 mb-3 rounded-full shadow-lg object-cover"
                    src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`}
                    alt={`${fullName} avatar`}
                />
                <h5 className="mb-1 text-xl font-medium text-gray-900 dark:text-white">{fullName}</h5>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>{email}</span>
                </div>

                <div className="flex mt-4 space-x-2">
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${roleColors[role]}`}>
                        {formattedRole}
                    </span>
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColors[status]}`}>
                        {formattedStatus}
                    </span>
                </div>
            </div>

            <div className="px-6 pb-4">
                <h6 className="mb-2 text-sm font-semibold text-gray-600 dark:text-gray-300 flex items-center">
                    <BarChart2 className="w-4 h-4 mr-2" />
                    User Stats
                </h6>
                <div className="grid grid-cols-3 gap-3">
                    <StatCard icon={Briefcase} label="Properties" value={stats?.propertiesListed ?? 0} />
                    <StatCard icon={Briefcase} label="Deals" value={stats?.dealsClosed ?? 0} />
                    <StatCard icon={Briefcase} label="Clients" value={stats?.clientsManaged ?? 0} />
                </div>
            </div>

            <div className="flex justify-center items-center p-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex space-x-2">
                    <button onClick={() => onViewProfile(user)} className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-700 dark:focus:ring-gray-700">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                    </button>
                    <button onClick={() => onEdit(user)} className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                    </button>
                    <button onClick={() => onDelete(user)} className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-900">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}