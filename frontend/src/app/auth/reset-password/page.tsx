"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import apiService from "@/services/api";
import { getSettingsData } from "../../../lib/Common/Settings";
import Image from "next/image";
import { showErrorToast } from "@/utils/toastHandler";
import { BuildingOffice2Icon } from "@heroicons/react/24/outline";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [settingsData, setSettingsData] = useState<AdminSettingData | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!token) {
      setIsError(true);
      setMessage("Invalid reset link");
      return;
    }

    if (password !== confirmPassword) {
      setIsError(true);
      setMessage("Passwords do not match");
      return;
    }

    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const res = await apiService.resetPassword(token, password);

      if (!res.success) {
        throw new Error(res.message);
      }

      setIsError(false);
      setMessage("Password reset successful. Redirecting...");

      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (error: unknown) {
      setIsError(true);

      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Something went wrong");
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

    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }

    const baseUrl = process.env.NEXT_PUBLIC_IMAGE_URL as string;
    return `${baseUrl}/logo/medium/${imageUrl}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 flex items-center justify-center p-4">
      <Link
        href="/"
        className="fixed top-4 left-4 text-gray-600 hover:text-gray-900 font-medium transition-colors flex items-center gap-2 z-10"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="h-4 w-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
          />
        </svg>
        <span className="hidden sm:inline">Back to Home</span>
      </Link>
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl md:p-8 p-6 border border-gray-100">
        {/* Logo */}
        <div className="text-center md:mb-8 mb-4">
          {settingsData?.logoUrl ? (
            <div style={{ display: "inline-block" }}>
              <Image
                src={getImageUrl(settingsData.logoUrl) as string}
                alt="Logo"
                width={70}
                height={70}
              />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center md:w-16 w-10 h-10 md:h-16 bg-blue-600 rounded-full md:rounded-2xl mb-1 md:mb-4">
              <BuildingOffice2Icon className="md:h-8 md:w-8 h-6 w-6 text-white logo-svg" />
            </div>
          )}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Reset Your Password</h1>
          <p className="text-gray-600 mt-2 md:mt-3">
            Enter your new password below to reset your account password.
          </p>
        </div>

        {/* Reset Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {message && (
            <div className={`rounded-lg p-4 ${isError ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
              <p className={`text-sm ${isError ? 'text-red-600' : 'text-green-700'}`}>
                {message}
              </p>
              {!isError && (
                <p className="text-green-600 text-xs mt-1">
                  Redirecting to login page...
                </p>
              )}
            </div>
          )}

          {!token && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-700 text-sm">
                Invalid or missing reset token. Please request a new password reset link.
              </p>
            </div>
          )}

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              New Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter your new password"
              disabled={loading || !token}
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Confirm your new password"
              disabled={loading || !token}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !token}
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
            {loading ? "Resetting Password..." : "Reset Password"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Remembered your password?{" "}
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