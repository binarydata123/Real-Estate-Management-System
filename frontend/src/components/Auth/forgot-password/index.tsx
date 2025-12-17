"use client";

import { BuildingOffice2Icon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import axios from "axios";
import { getSettingsData } from "../../../lib/Common/Settings";
import Image from "next/image";
import { showErrorToast } from "@/utils/toastHandler";

const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [settingsData, setSettingsData] = useState<AdminSettingData | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const handleForgotPassword = async (data: ForgotPasswordFormData) => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, data);
            setSuccess(response.data.message || "If an account with that email exists, a password reset link has been sent.");
        } catch (err: unknown) {  // ✅ use unknown instead of any
            if (axios.isAxiosError(error) && error.response) {
                // Error from the backend
                setError(error.response.data.message || 'An error occurred during forgot-password.');
            } else if (err instanceof Error) {
                setError(err.message || 'An unexpected error occurred.');
            } else {
                setError('An unexpected error occurred during signup.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await getSettingsData();
                if (response.success) {
                    const d = response.data;
                    setSettingsData(d);
                }
            } catch (err) {
                showErrorToast("Error", err);
            }
        };
        fetchSettings();
    }, []);

       const getImageUrl = (imageUrl?: string): string | undefined => {
        if (!imageUrl) {
            return;
        }
    
        // If it's already a full URL, return as is
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }
    
        // If it's a relative path, construct the full URL
        const baseUrl = process.env.NEXT_PUBLIC_IMAGE_URL as string;
            return `${baseUrl}/logo/medium/${imageUrl}`;
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 flex items-center justify-center p-4">
            <Link href="/" className="fixed top-4 left-4 text-gray-600 hover:text-gray-900 font-medium transition-colors flex items-center gap-2 z-10">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                <span className="hidden sm:inline">Back to Home</span>
            </Link>
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl md:p-8 p-6 border border-gray-100">
                {/* Logo */}
                <div className="text-center md:mb-8 mb-4">
                    {settingsData?.logoUrl
                        ?
                            <div style={{ display: 'inline-block' }}>
                                <Image
                                    src={getImageUrl(settingsData.logoUrl) as string}
                                    alt="Logo"
                                    width={70}
                                    height={70}
                                />
                            </div>
                        :
                            <div className="inline-flex items-center justify-center md:w-16 w-10 h-10 md:h-16 bg-blue-600 rounded-full md:rounded-2xl mb-1 md:mb-4">
                                <BuildingOffice2Icon className="md:h-8 md:w-8 h-6 w-6 text-white logo-svg" />
                            </div>
                    }
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Reset Your Password</h1>
                    <p className="text-gray-600 mt-2 md:mt-3">
                        Enter your email address and we&npos;ll send you a link to reset your password.
                    </p>
                </div>

                {/* Forgot Password Form */}
                <form
                    onSubmit={handleSubmit(handleForgotPassword)}
                    className="space-y-2 md:space-y-4"
                >
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-2 md:p-4">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-2 md:p-4">
                            <p className="text-green-700 text-sm">{success}</p>
                        </div>
                    )}

                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            {...register("email")}
                            className="w-full px-2 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Enter your registered email"
                            disabled={loading}
                        />
                        {errors.email && (
                            <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading && (
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        )}
                        {loading ? "Sending Link..." : "Send Reset Link"}
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-2 md:mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Remembered your password? {" "}
                        <Link
                            href="/auth/login"
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Back to Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
