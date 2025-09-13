'use client';
import React from 'react';
import UserCard, { UserProfile } from './UserCard';

// Mock data for demonstration
const mockUsers: UserProfile[] = [
    {
        id: '1',
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
        role: 'agent',
        status: 'active',
        lastSignIn: new Date().toISOString(),
        stats: {
            propertiesListed: 12,
            dealsClosed: 4,
            clientsManaged: 8,
        },
    },
    {
        id: '2',
        fullName: 'Jane Smith',
        email: 'jane.smith@example.com',
        avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
        role: 'agency_admin',
        status: 'active',
        lastSignIn: new Date().toISOString(),
        stats: {
            propertiesListed: 5,
            dealsClosed: 1,
            clientsManaged: 2,
        },
    },
    {
        id: '3',
        fullName: 'Peter Jones',
        email: 'peter.jones@example.com',
        avatarUrl: null, // Example with no avatar
        role: 'customer',
        status: 'pending',
        lastSignIn: new Date().toISOString(),
        stats: {
            propertiesListed: 0,
            dealsClosed: 0,
            clientsManaged: 0,
        },
    },
    {
        id: '4',
        fullName: 'Super Admin',
        email: 'super@reams.app',
        avatarUrl: 'https://randomuser.me/api/portraits/lego/1.jpg',
        role: 'super_admin',
        status: 'active',
        lastSignIn: new Date().toISOString(),
        stats: {
            propertiesListed: 100,
            dealsClosed: 50,
            clientsManaged: 200,
        },
    },
];

export default function UserManagement() {
    const handleEdit = (user: UserProfile) => {
        alert(`Editing user: ${user.fullName}`);
    };

    const handleDelete = (user: UserProfile) => {
        if (window.confirm(`Are you sure you want to delete ${user.fullName}?`)) {
            alert(`Deleting user: ${user.fullName}`);
        }
    };

    const handleViewProfile = (user: UserProfile) => {
        alert(`Viewing profile of: ${user.fullName}`);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 dark:bg-gray-900 min-h-screen">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">User Management</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {mockUsers.map(user => (
                    <UserCard
                        key={user.id}
                        user={user}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onViewProfile={handleViewProfile}
                    />
                ))}
            </div>
        </div>
    );
}