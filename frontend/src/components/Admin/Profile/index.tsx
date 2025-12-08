'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
//import { Edit, Mail, Phone, Shield, CalendarDays, CheckCircle2, XCircle } from 'lucide-react';
import { getAdminProfile, updateAdminProfile } from "@/lib/Admin/ProfileAPI";
import { useAuth } from "@/context/AuthContext";
import { showErrorToast } from '@/utils/toastHandler';

export default function AdminProfile() {
    const [admin, setAdmin] = useState<UserData | null>(null);
    const { user } = useAuth();
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        profilePictureUrl: '',
        profilePictureFile: null as File | null,
    });

    const toggleForm = () => {
        setShowForm(!showForm);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?._id) return;
        const data = new FormData();
        data.append("name", formData.name);
        data.append("phone", formData.phone);

        // Append profile picture file if selected
        if (formData.profilePictureFile) {
            data.append("profilePictureUrl", formData.profilePictureFile);
        }

        try {
            const response = await updateAdminProfile(user?._id, data);
            if (response.data.success) {
                setAdmin(response.data.data);
                setShowForm(false);
            }
        } catch (err) {
            showErrorToast("Error:",err);
        }
    };

    useEffect(() => {
        const fetchAdminProfile = async () => {
            try {
                const response = await getAdminProfile();
                if (response.success) {
                    setAdmin(response.data);
                    setFormData({
                        name: response.data.name || "",
                        email: response.data.email || "",
                        phone: response.data.phone || "",
                        profilePictureUrl: response.data.profilePictureUrl || "",
                        profilePictureFile: null as File | null,
                    });
                }
            } catch (err) {
            showErrorToast("Error",err);
            }
        };
        fetchAdminProfile();
    }, []);

    if (!admin) {
        return (
            <div className="flex justify-center items-center h-80">
                <p className="text-gray-500">Loading profile...</p>
            </div>
        );
    }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6 lg:px-16">
        {/* Page Header */}
        <div className="max-w-6xl mx-auto mb-10">
            <h1 className="text-3xl font-bold text-gray-900">Profile Overview</h1>
            <p className="text-gray-500 mt-1">Manage your profile and account settings</p>
        </div>

        {/* Profile Card */}
        {/* {!showForm && (
            <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm p-8 transition hover:shadow-md">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b pb-8"> */}
                    {/* Profile Info */}
                    {/* <div className="flex items-center gap-6">
                        <div className="relative w-28 h-28">
                            <Image
                                src={admin.profilePictureUrl || '/default-avatar-profile-new-img.png'}
                                alt={admin.name || ''}
                                fill
                                className="rounded-full object-cover border-4 border-gray-200 shadow-md"
                            />
                            {admin.status === "active" ? (
                                <CheckCircle2 className="absolute bottom-1 right-1 text-green-500 bg-white rounded-full w-6 h-6" />
                            ) : (
                                <XCircle className="absolute bottom-1 right-1 text-red-500 bg-white rounded-full w-6 h-6" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900">{admin.name}</h2>
                            <p className="text-gray-500 capitalize">{admin.role}</p>
                            <p
                                className={`mt-1 text-sm font-medium ${
                                admin.status === "active" ? "text-green-600" : "text-red-600"
                                }`}
                            >
                                {admin.status ? admin.status.toUpperCase() : ''}
                            </p>
                        </div>
                    </div> */}
                    {/* Edit Button */}
                    {/* <button
                        onClick={toggleForm}
                        className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow transition-all"
                    >
                        <Edit className="w-4 h-4 mr-2" />
                        {showForm ? "Cancel" : "Edit Profile"}
                    </button>
                </div> */}
                {/* Profile Details Section */}
                {/* <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="flex items-center gap-3">
                        <Mail className="text-gray-500 w-5 h-5" />
                        <span className="text-gray-800 font-medium">{admin.email}</span>
                    </div>

                    {admin.phone
                        ?
                            <div className="flex items-center gap-3">
                                <Phone className="text-gray-500 w-5 h-5" />
                                <span className="text-gray-800 font-medium">{admin.phone}</span>
                            </div>
                        :
                            ''
                    }

                    <div className="flex items-center gap-3">
                        <Shield className="text-gray-500 w-5 h-5" />
                        <span className="text-gray-800 font-medium capitalize">{admin.role}</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <CalendarDays className="text-gray-500 w-5 h-5" />
                        <span className="text-gray-800 font-medium">
                            Joined:{" "}
                            {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString("en-IN", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            }) : ''}
                        </span>
                    </div>
                </div>
            </div>
        )} */}
        {/* Inline Edit Form */}
        {/* {showForm && ( */}
            <form onSubmit={handleUpdate} className="border-t border-gray-200 pt-6 space-y-6 bg-white rounded-2xl p-6 shadow-sm mt-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Update Profile Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Enter your full name"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm cursor-not-allowed"
                            placeholder="Enter your email"
                            disabled
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Enter your phone number"
                        />
                    </div>
                </div>
                <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                    <div className="relative w-28 h-28">
                        <Image
                            src={formData.profilePictureUrl || "/default-avatar-profile-new-img.png"}
                            alt="Profile Picture"
                            fill
                            className="w-28 h-28 rounded-full object-cover border border-gray-300"
                        />
                        <input
                            type="file"
                            name="profilePictureUrl"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    setFormData({
                                        ...formData,
                                        profilePictureFile: file,                 // store file for upload
                                        profilePictureUrl: URL.createObjectURL(file), // preview
                                    });
                                }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full"
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Click on the image to upload a new profile picture</p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 mt-4">
                    <button
                        type="button"
                        onClick={toggleForm}
                        className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-700 hover:bg-gray-100 transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm font-medium transition"
                    >
                        Update Profile
                    </button>
                </div>
            </form>
        {/* )} */}

        {/* Account Settings Card */}
        {/* <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm p-8 mt-10 transition hover:shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Account Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <p className="text-sm text-gray-500 mb-1">Password</p>
                    <p className="text-gray-800 font-medium">••••••••</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500 mb-1">2-Factor Authentication</p>
                    <p className="text-gray-800 font-medium">Enabled</p>
                </div>
            </div>
            <div className="mt-6 flex justify-end">
                <button className="px-5 py-2.5 border border-gray-300 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg transition">
                    Manage Settings
                </button>
            </div>
        </div> */}
    </div>
  );
}
