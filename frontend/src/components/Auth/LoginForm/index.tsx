"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BuildingOffice2Icon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { signIn } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const handleLogin = async (loginData: LoginFormData) => {
        setLoading(true);
        setError(null);

        const { error, data } = await signIn(loginData);

        if (error) {
            setError(error.message || "Invalid credentials");
            setLoading(false);
        } else {
            router.push(`/${data?.user?.role}/dashboard`)
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg md:rounded-2xl shadow-xl md:p-6 p-3">
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
                <form onSubmit={handleSubmit(handleLogin)} className="space-y-2 md:space-y-6">
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
                            {...register('email')}
                            className="w-full md:px-4 px-2 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Enter your email"
                        />
                        {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
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
                            {...register('password')}
                            className="w-full md:px-4 px-2 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Enter your password"
                        />
                        {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 md:px-4 px-2 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Signing In..." : "Sign In"}
                    </button>
                </form>

                {/* Footer with registration and forgot password */}
                <div className="md:mt-6 mt-2 text-center space-y-1">
                    <div>
                        <Link
                            href="/auth/forgot-password"
                            className="inline-block text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                            Forgot your password?
                        </Link>
                    </div>

                    <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                        <span>Don’t have an account?</span>
                        <Link
                            href="/auth/signup"
                            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                            Create Agency
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
};
