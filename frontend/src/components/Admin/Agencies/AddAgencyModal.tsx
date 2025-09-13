'use client';
import React, { useState } from 'react';
import { PlusCircle, X } from 'lucide-react';

interface AddAgencyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddAgencyModal({ isOpen, onClose }: AddAgencyModalProps) {
    const [agencyName, setAgencyName] = useState('');
    const [logoUrl, setLogoUrl] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you would handle form submission here, e.g., call an API
        console.log('Creating new agency:', { agencyName, logoUrl });
        // Reset form and close modal
        setAgencyName('');
        setLogoUrl('');
        onClose();
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={onClose} // Close on overlay click
        >
            <div
                className="relative w-full max-w-md transform rounded-lg bg-white p-6 text-left shadow-xl dark:bg-gray-800"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
                <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                        Add New Agency
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
                    >
                        <span className="sr-only">Close</span>
                        <X className="h-6 w-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="mt-4 space-y-6">
                    <div>
                        <label htmlFor="agencyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Agency Name
                        </label>
                        <div className="mt-2">
                            <input
                                type="text"
                                name="agencyName"
                                id="agencyName"
                                className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600 dark:focus:ring-blue-500"
                                placeholder="e.g., Prestige Properties"
                                value={agencyName}
                                onChange={(e) => setAgencyName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Logo URL (Optional)
                        </label>
                        <div className="mt-2">
                            <input
                                type="url"
                                name="logoUrl"
                                id="logoUrl"
                                className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600 dark:focus:ring-blue-500"
                                placeholder="https://example.com/logo.png"
                                value={logoUrl}
                                onChange={(e) => setLogoUrl(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            className="inline-flex justify-center rounded-md border border-gray-300 bg-white md:px-4 px-2 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 md:px-4 px-2 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            <PlusCircle className="-ml-1 mr-2 h-5 w-5" />
                            Create Agency
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

