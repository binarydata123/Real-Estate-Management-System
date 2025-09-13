"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BuildingOffice2Icon } from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';

export const LoginForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { signIn } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await signIn({ email, password });

        if (error) {
            setError(error.message || "Invalid credentials");
            setLoading(false);
        } else {
            router.push("/agent/dashboard")
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg md:rounded-2xl shadow-xl md:p-8 p-2">
                {/* Logo */}
                <div className="text-center md:mb-8 mb-3">
                    <div className="inline-flex items-center justify-center md:w-16 w-10 h-10 md:h-16 bg-blue-600 rounded-full md:rounded-2xl mb-1 md:mb-4">
                        <BuildingOffice2Icon className="md:h-8 md:w-8 h-6 w-6 text-white logo-svg" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">REAMS</h1>
                    <p className="text-gray-600 md:mt-2 hidden md:block">
                        Real Estate Management System
                    </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-3 md:space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 mb-1 md:mb-2"
                        >
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full md:px-4 px-2 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Enter your email"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700 mb-1 md:mb-2"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full md:px-4 px-2 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Enter your password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 md:px-4 px-2 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Signing In..." : "Sign In"}
                    </button>
                </form>

                {/* Footer */}
                <div className="md:mt-6 mt-2 text-center">
                    <div className="mb-2 md:mb-4 p-2 md:p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-medium text-blue-900 mb-2">
                            Demo Login Credentials
                        </h3>
                        <div className="text-sm text-blue-800 space-y-1">
                            <p>
                                <strong>Agent Dashboard:</strong> Any email/password
                            </p>
                            <p>
                                <strong>User Dashboard:</strong>{" "}
                                <Link
                                    href="/user-dashboard"
                                    className="underline hover:text-blue-900"
                                >
                                    Click here to access
                                </Link>
                            </p>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500">
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/auth/signup"
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Create Agency
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
