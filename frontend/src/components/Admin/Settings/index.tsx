'use client';

import React, { useState, useEffect } from "react";
import { Upload, Lock, Bell, FileText, Save } from "lucide-react";
import Image from 'next/image';
import { getAdminSettings, saveAdminSettings } from "@/lib/Admin/AdminSettingsAPI";
import { showErrorToast, showSuccessToast } from '@/utils/toastHandler';
import { useAuth } from "@/context/AuthContext";

export default function AdminSettings() {
    const [formData, setFormData] = useState({
        logoUrl: '',
        logoFile: null as File | null,
        faviconUrl: '',
        faviconFile: null as File | null,
        footerContent: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        notificationEmailAlert: false,
        notificationLoginAlert: false,
        notificationUpdatesAlert: false,
        notificationSecurityAlert: false,
    });
    const { user } = useAuth();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleCheckboxChange = (key: keyof typeof formData) => {
        setFormData(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        data.append("footerContent", formData.footerContent);
        data.append("currentPassword", formData.currentPassword);
        data.append("newPassword", formData.newPassword);
        data.append("confirmPassword", formData.confirmPassword);
        // Convert booleans to strings
        data.append("notificationEmailAlert", formData.notificationEmailAlert ? "true" : "false");
        data.append("notificationLoginAlert", formData.notificationLoginAlert ? "true" : "false");
        data.append("notificationUpdatesAlert", formData.notificationUpdatesAlert ? "true" : "false");
        data.append("notificationSecurityAlert", formData.notificationSecurityAlert ? "true" : "false");

        // Append profile picture file if selected
        if (formData.logoFile) {
            data.append("logoUrl", formData.logoFile);
        }

        if (formData.faviconFile) {
            data.append("faviconUrl", formData.faviconFile);
        }
        try {
            const response = await saveAdminSettings(user?._id || '', data);
            console.log(response.data.message);
            if (response.data.success) {
                showSuccessToast(response.data.message);
            } else {
                showErrorToast(response.data.message);
            }
        } catch (err) {
            showErrorToast("Error:",err);
        }
    };

    useEffect(() => {
        const fetchAdminSettings = async () => {
            try {
                const response = await getAdminSettings();
                if (response.success) {
                    const d = response.data;
                    setFormData(prev => ({
                        ...prev,
                        footerContent: d.footerContent || "",
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                        logoUrl: d.logoUrl || "",
                        faviconUrl: d.faviconUrl || "",
                        notificationEmailAlert: d.notificationEmailAlert ?? false,
                        notificationLoginAlert: d.notificationLoginAlert ?? false,
                        notificationUpdatesAlert: d.notificationUpdatesAlert ?? false,
                        notificationSecurityAlert: d.notificationSecurityAlert ?? false,
                    }));
                }
            } catch (err) {
                showErrorToast("Error", err);
            }
        };
        fetchAdminSettings();
    }, []);
    return (
        <div className="min-h-screen bg-gray-50 py-10 px-6 lg:px-16">
            {/* Page Header */}
            <div className="max-w-6xl mx-auto mb-10">
                <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
                <p className="text-gray-500 mt-1">Manage system-wide configuration</p>
            </div>
            <div className="max-w-6xl mx-auto space-y-10">
                {/* Logo Upload */}
                <form onSubmit={handleSave} className="border-t border-gray-200 pt-6 space-y-6 bg-white rounded-2xl p-6 shadow-sm mt-4">
                    <div className="bg-white rounded-2xl shadow-sm p-8 hover:shadow-md transition">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            {/* <Image className="text-blue-600 w-5 h-5" /> Website Logo */}
                            Website Logo
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">Upload your brand logo</p>
                        <div className="flex items-center gap-10 mt-6">
                            <div className="w-32 h-32 border rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden shadow-inner">
                                <Image
                                    src={formData.logoUrl || "/default-logo.png"} // fallback if null
                                    alt="Logo"
                                    width={130}
                                    height={130}
                                />
                            </div>

                            <label
                                className="cursor-pointer px-5 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 flex items-center gap-2 transition"
                            >
                                <Upload className="w-4" /> Upload Logo
                                <input
                                    type="file"
                                    name="logoUrl"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setFormData(prev => ({
                                                ...prev,
                                                logoFile: file,
                                                logoUrl: URL.createObjectURL(file)
                                            }));
                                        }
                                    }}
                                />
                            </label>
                        </div>
                    </div>
                    {/* Favicon Upload */}
                    <div className="bg-white rounded-2xl shadow-sm p-8 hover:shadow-md transition">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            {/* <Image className="text-blue-600 w-5 h-5"/> Website Favicon */}
                            Website Favicon
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">Upload your browser tab icon</p>
                        <div className="flex items-center gap-10 mt-6">
                            <div className="w-16 h-16 border rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden shadow-inner">
                                {/* <Image src={formData.faviconUrl || "/default-logo.png"} alt="Favicon" width={60} height={60} /> */}
                                <Image
                                src={formData.faviconUrl || '/default-logo.png'}
                                alt={'Favicon'}
                                width={60} 
                                height={60}
                            />
                            </div>
                            <label
                                className="cursor-pointer px-5 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 flex items-center gap-2 transition"
                            >
                                <Upload className="w-4" /> Upload Favicon
                                <input
                                    type="file"
                                    name="faviconUrl"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setFormData(prev => ({
                                                ...prev,
                                                faviconFile: file,
                                                faviconUrl: URL.createObjectURL(file)
                                            }));
                                        }
                                    }}
                                />
                            </label>
                        </div>
                    </div>
                    {/* Password Change */}
                    <div className="bg-white rounded-2xl shadow-sm p-8 hover:shadow-md transition">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <Lock className="text-blue-600 w-5 h-5" /> Change Password
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">Update your login credentials</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <input
                                type="password"
                                name="currentPassword"
                                placeholder="Current Password"
                                className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-600"
                                value={formData.currentPassword}
                                onChange={handleChange}
                            />
                            <input
                                type="password"
                                name="newPassword"
                                placeholder="New Password"
                                className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-600"
                                value={formData.newPassword}
                                onChange={handleChange}
                            />
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm New Password"
                                className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-600"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    {/* Footer Content */}
                    <div className="bg-white rounded-2xl shadow-sm p-8 hover:shadow-md transition">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <FileText className="text-blue-600 w-5 h-5" /> Footer Copyright
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">Update footer text</p>

                        <input
                            type="text"
                            name="footerContent"
                            value={formData.footerContent}
                            onChange={handleChange}
                            className="w-full mt-4 border rounded-lg px-4 py-3 shadow-inner focus:ring-2 focus:ring-blue-600"
                        />
                    </div>
                    {/* Notifications */}
                    <div className="bg-white rounded-2xl shadow-sm p-8 hover:shadow-md transition">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <Bell className="text-blue-600 w-5 h-5" /> Notification Preferences
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">Choose alert types</p>
                        <div className="mt-6 space-y-4">
                            {([
                                ["notificationEmailAlert", "Email Alerts"],
                                ["notificationLoginAlert", "Login Notifications"],
                                ["notificationUpdatesAlert", "System Updates"],
                                ["notificationSecurityAlert", "Security Warnings"]
                            ] as [keyof typeof formData, string][]).map(([key, label]) => (
                                <label key={key} className="flex items-center gap-3 text-gray-800">
                                    <input
                                        type="checkbox"
                                        checked={formData[key] as boolean}
                                        onChange={() => handleCheckboxChange(key)}
                                        className="w-5 h-5"
                                    />
                                    {label}
                                </label>
                            ))}
                        </div>
                    </div>
                    {/* Save Button */}
                    <div className="flex justify-end">
                        <button
                        type="submit"
                            className="px-8 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 flex items-center gap-2 transition"
                        >
                            <Save className="w-5" /> Save Settings
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
