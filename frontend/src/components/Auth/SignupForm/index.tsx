'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { BuildingOffice2Icon } from '@heroicons/react/24/outline';
import { registerAgency } from '@/lib/Authentication/AuthenticationAPI';

// 1. Define the validation schema with Zod
const signupSchema = z.object({
    fullName: z.string().min(1, 'Full name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'A valid phone number is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    agencyName: z.string().min(1, 'Agency name is required'),
    agencySlug: z.string().min(1, 'URL slug is required').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens.'),
});

type SignupFormData = z.infer<typeof signupSchema>;

const SignupForm = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 2. Set up react-hook-form
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
    });

    // 3. Watch for changes in agencyName to auto-generate the slug
    const agencyNameValue = watch('agencyName');
    useEffect(() => {
        if (agencyNameValue) {
            const slug = agencyNameValue
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
            setValue('agencySlug', slug, { shouldValidate: true });
        }
    }, [agencyNameValue, setValue]);

    // 4. Handle form submission with validated data
    const handleSignup = async (data: SignupFormData) => {
        setLoading(true);
        setError(null);

        try {
            // Add userId field that the backend expects
            const registrationData = {
                ...data,
                userId: data.email, // Use email as userId for now
            };

            const response = await registerAgency(registrationData);
            alert(response.data.message || 'Agency created successfully! Please check your email to verify your account.');
            // router.push('/auth/login');
        } catch (error: unknown) {  // ✅ use unknown instead of any
            if (axios.isAxiosError(error) && error.response) {
                // Error from the backend
                setError(error.response.data.message || 'An error occurred during signup.');
            } else if (error instanceof Error) {
                setError(error.message || 'An unexpected error occurred.');
            } else {
                setError('An unexpected error occurred during signup.');
            }
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-2 md:p-4">
            <div className="max-w-md w-full bg-white rounded-lg md:rounded-2xl shadow-xl md:p-6 p-3">
                {/* Logo */}
                <div className="text-center md:mb-8 mb-3">
                    <div className="inline-flex items-center justify-center md:w-16 w-10 h-10 md:h-16 bg-blue-600 rounded-full md:rounded-2xl mb-1 md:mb-4">
                        <BuildingOffice2Icon className="md:h-8 md:w-8 h-6 w-6 text-white logo-svg" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Create Agency</h1>
                    <p className="text-gray-600 mt-2 hidden md:block">
                        Start managing your real estate business
                    </p>
                </div>

                {/* Signup Form */}
                <form onSubmit={handleSubmit(handleSignup)} className="space-y-2 md:space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-2 md:p-4">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-2 md:gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
                                Your Full Name
                            </label>
                            <input
                                {...register('fullName')}
                                type="text"
                                className="w-full md:px-4 px-2 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="John Doe"
                            />
                            {errors.fullName && <p className="text-red-600 text-sm mt-1">{errors.fullName.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
                                Email Address
                            </label>
                            <input
                                {...register('email')}
                                type="email"
                                className="w-full md:px-4 px-2 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="john@example.com"
                            />
                            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
                                Phone Number
                            </label>
                            <input
                                {...register('phone')}
                                type="tel"
                                className="w-full md:px-4 px-2 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="+1 234 567 8901"
                            />
                            {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
                                Password
                            </label>
                            <input
                                {...register('password')}
                                type="password"
                                className="w-full md:px-4 px-2 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Create a secure password"
                            />
                            {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
                                Agency Name
                            </label>
                            <input
                                {...register('agencyName')}
                                type="text"
                                className="w-full md:px-4 px-2 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="ABC Real Estate"
                            />
                            {errors.agencyName && <p className="text-red-600 text-sm mt-1">{errors.agencyName.message}</p>}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 md:px-4 px-2 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating Agency...' : 'Create Agency'}
                    </button>
                </form>

                {/* Footer */}
                <div className="md:mt-6 mt-3 text-center">
                    <p className="text-sm text-gray-500">
                        Already have an account?{' '}
                        <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignupForm;
