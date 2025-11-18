"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BuildingOffice2Icon,
  EyeIcon,
  EyeSlashIcon,
  ArrowLeftIcon,
  UserIcon,
  AtSymbolIcon,
  ExclamationCircleIcon,
  ChevronRightIcon,
  LockClosedIcon,
  PhoneIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth, Agency } from "@/context/AuthContext";
import {
  loginUser,
  selectCustomerAgency,
} from "@/lib/Authentication/AuthenticationAPI";
import { showErrorToast, showSuccessToast } from "@/utils/toastHandler";

const agencyLoginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  loginAs: z.enum(["agency", "admin"]),
  phone: z.undefined().optional(),
});

const customerLoginSchema = z.object({
  phone: z.string().min(10, "A valid phone number is required"),
  loginAs: z.literal("customer"),
  email: z.undefined().optional(),
  password: z.undefined().optional(),
});

interface AgencySelectionInfo extends Agency {
  customerId: string;
}

export type LoginData = z.infer<
  typeof agencyLoginSchema | typeof customerLoginSchema
>;

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginAs, setLoginAs] = useState<
    "agency" | "customer" | "admin" | null
  >(null);
  const [agenciesToSelect, setAgenciesToSelect] = useState<
    AgencySelectionInfo[] | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { signIn, completeSignIn } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginData>({
    resolver: zodResolver(
      loginAs === "customer" ? customerLoginSchema : agencyLoginSchema
    ),
    // Re-validate when loginAs changes
    context: { loginAs },
  });

  const handleLogin = async (loginData: LoginData) => {
    setLoading(true);
    setError(null);
    try {
      // The backend now returns a different shape for multi-agency customers
      const response = await loginUser(loginData);

      if (response.data.success) {
        showSuccessToast(response.data.message || "Login successful!");

        if (response.data.requiresSelection) {
          setAgenciesToSelect(response.data.agencies);
        } else {
          // Standard login for agency or single-agency customer
          const { error: signInError, data: signInData } = await signIn(
            response
          );
          if (signInError) {
            setError(signInError.message || "Invalid credentials");
          } else {
            router.push(`/${signInData?.user?.role}/dashboard`);
          }
        }
      } else {
        // This case might not be hit if backend always throws errors, but it's good for safety
        setError(response.data.message || "An unknown error occurred.");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      // Catches errors from axios (like 401, 403, 500 status codes)
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "An unknown error occurred.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAgencySelection = async (customerId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await selectCustomerAgency(customerId);
      if (response.data.success) {
        const { user, token } = response.data;
        completeSignIn(user, token);
      } else {
        setError(response.data.message || "Failed to select agency.");
        setLoading(false);
      }
    } catch (err) {
      showErrorToast("An error occurred while selecting the agency.", err);
      setLoading(false);
    }
  };

  const handleRoleSelect = (role: "agency" | "customer" | "admin") => {
    setLoginAs(role);
    setError(null);
    if (role === "agency") {
      reset({ loginAs: "agency", email: "", password: "" });
    } else if (role === "admin") {
      reset({ loginAs: "admin", email: "", password: "" });
    } else {
      reset({ loginAs: "customer", phone: "" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-200 to-purple-200 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl md:p-8 p-6 transition-all duration-300">
        {/* Logo */}
        <div className="text-center md:mb-8 mb-2">
          <div className="inline-flex items-center justify-center md:w-16 w-10 h-10 md:h-16 bg-blue-600 rounded-full md:rounded-2xl mb-1 md:mb-4">
            <BuildingOffice2Icon className="md:h-8 md:w-8 h-6 w-6 text-white logo-svg" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            REAMS
          </h1>
          <p className="text-gray-600 md:mt-2 hidden md:block">
            Real Estate Management System
          </p>
        </div>

        {agenciesToSelect ? (
          // Agency Selection Screen
          <div className="space-y-3 md:space-y-6">
            <div className="relative mb-2 md:mb-4 text-center">
              <button
                onClick={() => {
                  setAgenciesToSelect(null);
                  setLoginAs(null);
                }}
                className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Go back"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <h2 className="text-center text-sm md:text-xl font-semibold text-gray-800 inheritClass">
                Select Your Agency
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {agenciesToSelect.map((agency) => (
                <button
                  key={agency.customerId}
                  onClick={() => handleAgencySelection(agency.customerId)}
                  disabled={loading}
                  className="group w-full flex items-center gap-4 p-4 bg-white/60 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-sm hover:shadow-lg transform hover:-translate-y-1 disabled:opacity-50"
                >
                  <p className="font-semibold text-gray-800 text-left flex-1">
                    {agency.name}
                  </p>
                  <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-transform duration-300 transform group-hover:translate-x-1" />
                </button>
              ))}
            </div>
          </div>
        ) : !loginAs ? (
          // Role Selection Screen
          <div className="space-y-3 md:space-y-6">
            <h2 className="text-center text-sm md:text-xl font-semibold text-gray-800 inheritClass">
              Sign in to your account
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => handleRoleSelect("agency")}
                className="group w-full flex items-center gap-4 p-4 bg-white/60 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-sm hover:shadow-lg transform hover:-translate-y-1"
              >
                <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center bg-blue-100 rounded-lg">
                  <BuildingOffice2Icon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-800 text-left">
                    Agency / Agent
                  </p>
                  <p className="text-sm text-gray-600 text-left">
                    Grow your business fast.
                  </p>
                </div>
                <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-transform duration-300 transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => handleRoleSelect("customer")}
                className="group w-full flex items-center gap-4 p-4 bg-white/60 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all shadow-sm hover:shadow-lg transform hover:-translate-y-1"
              >
                <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center bg-purple-100 rounded-lg">
                  <UserIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-800 text-left">
                    Customer
                  </p>
                  <p className="text-sm text-gray-600 text-left">
                    Find your dream home.
                  </p>
                </div>
                <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-transform duration-300 transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => handleRoleSelect("admin")}
                className="group w-full flex items-center gap-4 p-4 bg-white/60 border border-gray-200 rounded-lg hover:border-red-500 hover:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all shadow-sm hover:shadow-lg transform hover:-translate-y-1"
              >
                <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center bg-red-100 rounded-lg">
                  <ShieldCheckIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-800 text-left">Admin</p>
                  <p className="text-sm text-gray-600 text-left">
                    Manage the system.
                  </p>
                </div>
                <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-red-600 transition-transform duration-300 transform group-hover:translate-x-1" />
              </button>
            </div>
            <div className="text-center pt-2">
              <p className="text-sm text-gray-600">
                Don’t have an agency account?{" "}
                <Link
                  href="/auth/signup"
                  className="font-semibold text-blue-600 hover:underline"
                >
                  Create one now
                </Link>
              </p>
            </div>
          </div>
        ) : (
          // Login Form
          <>
            <div className="relative mb-2 md:mb-4 text-center">
              <button
                onClick={() => setLoginAs(null)}
                className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Go back"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <h2 className="text-sm md:text-xl font-semibold text-gray-800 inheritClass">
                Sign in as{" "}
                {loginAs === "agency"
                  ? "an Agency"
                  : loginAs === "admin"
                  ? "an Admin"
                  : "a Customer"}
              </h2>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(handleLogin)(e);
              }}
              className="space-y-2 md:space-y-6"
            >
              {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-3">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {loginAs === "agency" || loginAs === "admin" ? (
                <>
                  <div
                    className="animate-slide-in-up"
                    style={{ animationDelay: "100ms" }}
                  >
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <AtSymbolIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </div>
                      <input
                        id="email"
                        type="email"
                        {...register("email")}
                        autoFocus
                        className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.email ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="you@example.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div
                  className="animate-slide-in-up"
                  style={{ animationDelay: "100ms" }}
                >
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <PhoneIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      {...register("phone")}
                      autoFocus
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.phone ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              )}

              {(loginAs === "agency" || loginAs === "admin") && (
                <div
                  className="animate-slide-in-up"
                  style={{ animationDelay: "200ms" }}
                >
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <LockClosedIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      {...register("password")}
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.password ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center bg-blue-600 text-white py-3 md:px-4 px-2 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
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
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            {/* Footer with registration and forgot password */}
            <div className="md:mt-6 mt-4 text-center space-y-2 md:space-y-4">
              {(loginAs === "agency" || loginAs === "admin") && (
                <div>
                  <Link
                    href="/auth/forgot-password"
                    className="inline-block text-sm text-blue-600 hover:underline font-medium transition-colors"
                  >
                    Forgot your password?
                  </Link>
                </div>
              )}

              <div className="text-sm text-gray-600">
                <span>Don’t have an account? </span>
                <Link
                  href="/auth/signup"
                  className="font-semibold text-blue-600 hover:underline"
                >
                  Create Agency
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
