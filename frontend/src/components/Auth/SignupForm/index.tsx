/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { registerAgency } from '@/lib/Authentication/AuthenticationAPI';
import { BuildingOffice2Icon, UserIcon, AtSymbolIcon, PhoneIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

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
    const [showPassword, setShowPassword] = useState(false);
    const { signIn } = useAuth();
    const router = useRouter();

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
    const handleSignup = async (registrationData: SignupFormData) => {
        setLoading(true);
        setError(null);

        try {
            // Step 1: Register the agency
            const registerResponse = await registerAgency(registrationData);

            if (!registerResponse?.data?.success) {
                throw new Error(
                    registerResponse?.data?.message || "Failed to register agency.",
                );
            }

            // Step 2: Auto-login after successful registration
            const { error: loginError, data: loginData } = await signIn({
                email: registrationData.email,
                password: registrationData.password,
                loginAs: "agency",
            });

            if (loginError) {
                throw new Error(loginError.message || "Login failed after signup.");
            }

            // Step 3: Redirect on success
            router.push(`/${loginData?.user?.role}/dashboard`);
        } catch (err: unknown) {
            if (axios.isAxiosError(err) && err.response) {
                // Backend error
                setError(err.response.data.message || "Signup failed.");
            } else if (err instanceof Error) {
                setError(err.message || "An unexpected error occurred.");
            } else {
                setError("An unexpected error occurred during signup.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-200 to-purple-200 flex items-center justify-center p-4">
            <div className="max-w-lg w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl md:p-8 p-6">
                {/* Logo */}
                <div className="text-center md:mb-8 mb-3">
                    <div className="inline-flex items-center justify-center md:w-16 w-10 h-10 md:h-16 bg-blue-600 rounded-full md:rounded-2xl mb-1 md:mb-4">
                        <BuildingOffice2Icon className="md:h-8 md:w-8 h-6 w-6 text-white logo-svg" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Create Your Agency</h1>
                    <p className="text-gray-600 md:mt-2 hidden md:block">
                        Start managing your real estate business
                    </p>
                </div>

                {/* Signup Form */}
                <form onSubmit={handleSubmit(handleSignup)} className="space-y-4 md:space-y-6">
                    {error && (
                        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-3">
                            <ExclamationCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Personal Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField icon={UserIcon} name="fullName" placeholder="John Doe" register={register} error={errors.fullName} label="Your Full Name" />
                        <InputField icon={AtSymbolIcon} name="email" type="email" placeholder="john@example.com" register={register} error={errors.email} label="Email Address" />
                        <InputField icon={PhoneIcon} name="phone" type="tel" placeholder="+91 98765 43210" register={register} error={errors.phone} label="Phone Number" />
                        <div className="relative">
                            <InputField icon={LockClosedIcon} name="password" type={showPassword ? 'text' : 'password'} placeholder="Create a secure password" register={register} error={errors.password} label="Password" />
                            <span onClick={() => setShowPassword(!showPassword)} className="absolute bottom-3 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600" aria-label={showPassword ? "Hide password" : "Show password"}>
                                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                            </span>
                        </div>
                    </div>

                    {/* Agency Information */}
                    <div className="space-y-4 pt-4 border-t border-gray-200">
                        <InputField icon={BuildingOffice2Icon} name="agencyName" placeholder="Your Awesome Agency" register={register} error={errors.agencyName} label="Agency Name" />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center bg-blue-600 text-white py-3 md:px-4 px-2 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading && (
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {loading ? 'Creating Agency...' : 'Create Agency'}
                    </button>
                </form>

                {/* Footer */}
                <div className="md:mt-6 mt-4 text-center">
                    <p className="text-sm text-gray-500">
                        Already have an account?{' '}
                        <Link href="/auth/login" className="font-semibold text-blue-600 hover:underline">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

interface InputFieldProps {
    icon: React.ElementType;
    name: keyof SignupFormData;
    label: string;
    placeholder: string;
    register: any;
    error?: { message?: string };
    type?: string;
}

const InputField: React.FC<InputFieldProps> = ({ icon: Icon, name, label, placeholder, register, error, type = 'text' }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
        </label>
        <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
                {...register(name)}
                type={type}
                className={`w-full pl-8 pr-3 py-3 border rounded-lg focus:ring-1 transition-colors ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                placeholder={placeholder}
            />
        </div>
        {error && <p className="text-red-600 text-sm mt-1">{error.message}</p>}
    </div>
);

export default SignupForm;
