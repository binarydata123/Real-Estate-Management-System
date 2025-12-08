'use client';
import React, { useState, useEffect } from "react";
//import { Upload, Lock, Bell, FileText, X } from "lucide-react";
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
        removedLogo: false,
        removedFavicon: false,
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
        // ⭐ LOGO LOGIC
        if (formData.logoFile) {
            data.append("logoUrl", formData.logoFile);
        } else if (formData.removedLogo) {
            data.append("logoUrl", ""); // Remove logo in DB
        }

        // ⭐ FAVICON LOGIC
        if (formData.faviconFile) {
            data.append("faviconUrl", formData.faviconFile);
        } else if (formData.removedFavicon) {
            data.append("faviconUrl", ""); // Remove favicon in DB
        } 
        try {
            const response = await saveAdminSettings(user?._id || '', data);
            if (response.data.success) {
                showSuccessToast(response.data.message);
            } else {
                showErrorToast(response.data.message);
            }
            setFormData(prev => ({
                ...prev,
                removedLogo: false,
                removedFavicon: false
            }));
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
                <form onSubmit={handleSave}>
                    <div className="bg-white rounded-2xl shadow-sm p-8 mb-3 hover:shadow-md transition">
                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">
                            {/* <Image className="text-blue-600 w-5 h-5" /> Website Logo */}
                            Website Logo
                        </h3>
                        <p className="text-gray-500 text-sm mt-1">Upload your Website logo</p>
                        <div className="flex flex-col">
                            <div className="relative w-28 h-28">
                                <Image
                                    src={formData.logoUrl || "/default-logo.png"}
                                    alt="Profile Picture"
                                    fill
                                    className="w-28 h-28 rounded-full object-cover border border-gray-300"
                                />
                                <input
                                    type="file"
                                    name="logoUrl"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setFormData({
                                                ...formData,
                                                logoFile: file,                 // store file for upload
                                                logoUrl: URL.createObjectURL(file), // preview
                                            });
                                        }
                                    }}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Click on the image to upload a new logo image</p>
                        </div>
                        {/* <div className="flex items-center gap-10 mt-6">
                            {formData.logoUrl 
                                ? (
                                    <>
                                        <div className="w-32 h-32 border rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden shadow-inner">
                                            <Image
                                                src={formData.logoUrl || "/default-logo.png"} // fallback if null
                                                alt="Logo"
                                                width={130}
                                                height={130}
                                            />
                                        </div> */}
                                        {/* ❌ REMOVE LOGO */}
                                        {/* <button
                                            type="button"
                                            onClick={() =>
                                                setFormData(prev => ({
                                                    ...prev,
                                                    logoUrl: '',
                                                    logoFile: null,
                                                    removedLogo: true
                                                }))
                                            }
                                            className="bg-red-600 text-white text-xs px-1 py-1 rounded"
                                            style={{ position: "relative", right: "53px", bottom: "60px", borderRadius: "15px" }}
                                        >
                                            <X size={14} />
                                        </button> */}
                                    {/* </>
                                ) : (
                                    <div className="w-32 h-32 border rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden shadow-inner">
                                        <span className="text-gray-400">No Logo</span>
                                    </div>
                            )}
                            <label className="cursor-pointer px-5 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 flex items-center gap-2 transition">
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
                                                logoUrl: URL.createObjectURL(file),
                                                removedLogo: false
                                            }));
                                        }
                                    }}
                                />
                            </label>
                        </div> */}
                    </div>
                    {/* Favicon Upload */}
                    <div className="bg-white rounded-2xl shadow-sm p-8 mb-3 hover:shadow-md transition">
                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">
                            {/* <Image className="text-blue-600 w-5 h-5"/> Website Favicon */}
                            Website Favicon
                        </h3>
                        <p className="text-gray-500 text-sm mt-1">Upload your browser tab icon</p>
                        <div className="flex flex-col">
                            <div className="relative w-16 h-16">
                                <Image
                                    src={formData.faviconUrl || "/default-favicon-img.png"}
                                    alt="Profile Picture"
                                    fill
                                    className="w-16 h-16 rounded-full object-cover border border-gray-300"
                                />
                                <input
                                    type="file"
                                    name="faviconUrl"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setFormData({
                                                ...formData,
                                                faviconFile: file,                 // store file for upload
                                                faviconUrl: URL.createObjectURL(file), // preview
                                            });
                                        }
                                    }}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Click on the image to upload a new favicon image</p>
                        </div>
                        {/* <div className="flex items-center gap-10 mt-6">
                            {formData.faviconUrl 
                                ? (
                                    <>
                                        <div className="w-16 h-16 border rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden shadow-inner">
                                            <Image
                                                src={formData.faviconUrl || '/default-logo.png'}
                                                alt={'Favicon'}
                                                width={60} 
                                                height={60}
                                            />
                                        </div> */}
                                        {/* ❌ REMOVE FAVICON */}
                                        {/* <button
                                            type="button"
                                            onClick={() =>
                                                setFormData(prev => ({
                                                    ...prev,
                                                    faviconUrl: '',
                                                    faviconFile: null,
                                                    removedFavicon: true
                                                }))
                                            }
                                            className="bg-red-600 text-white text-xs px-1 py-1 rounded"
                                            style={{ position: "relative", right: "53px", bottom: "30px", borderRadius: "15px" }}
                                        >
                                            <X size={14} />
                                        </button>
                                    </>
                                ) : (
                                    <div className="w-16 h-16 border rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden shadow-inner">
                                        <span className="text-gray-400">No Icon</span>
                                    </div>
                            )}
                            <label className="cursor-pointer px-5 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 flex items-center gap-2 transition">
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
                        </div> */}
                    </div>
                    {/* Password Change */}
                    <div className="bg-white rounded-2xl shadow-sm p-8 mb-3 hover:shadow-md transition">
                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">
                            {/* <Lock className="text-blue-600 w-5 h-5" /> Change Password */}
                            Change Password
                        </h3>
                        <p className="text-gray-500 text-sm mt-1">Update your login credentials</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <input
                                type="password"
                                name="currentPassword"
                                placeholder="Current Password"
                                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={formData.currentPassword}
                                onChange={handleChange}
                            />
                            <input
                                type="password"
                                name="newPassword"
                                placeholder="New Password"
                                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={formData.newPassword}
                                onChange={handleChange}
                            />
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm New Password"
                                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    {/* Footer Content */}
                    <div className="bg-white rounded-2xl shadow-sm p-8 mb-3 hover:shadow-md transition">
                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">
                            {/* <FileText className="text-blue-600 w-5 h-5" /> Footer Copyright */}
                            Footer Copyright
                        </h3>
                        <p className="text-gray-500 text-sm mt-1">Update footer text</p>
                        <input
                            type="text"
                            name="footerContent"
                            value={formData.footerContent}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                    {/* Notifications */}
                    <div className="bg-white rounded-2xl shadow-sm p-8 mb-3 hover:shadow-md transition">
                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">
                            {/* <Bell className="text-blue-600 w-5 h-5" /> Notification Preferences */}
                            Notification Preferences
                        </h3>
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
                            className="flex px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm font-medium transition"
                        >
                            Save Settings
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
