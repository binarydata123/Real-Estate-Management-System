"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import InfoPopup from "../../Common/PopMessage";
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
import OtpModal from "./OtpModal";
import { getSettingsData } from "../../../lib/Common/Settings";
import Image from "next/image";
import InstallButton from "@/components/Common/InstallButton";
import apiService from "@/services/api";

const agencyLoginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  loginAs: z.enum(["agency", "admin"]),
  phone: z.undefined().optional(),
});

const customerLoginSchema = z.object({
  phone: z
    .string()
    .min(10, "Minimum 10 digits are required")
    .max(10, "Maximum 10 digits are required")
    .regex(/^[6-9]\d{9}$/, "A Valid Number is Required"),
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

interface errorSchema {
  response?: {
    data?: {
      message?: string;
      forceLogout?: string;
    };
  };
  message?: string;
}

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
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
  const [openOtpModal, setOpenOtpModal] = useState(false);
  const [pendingLoginData, setPendingLoginData] = useState<LoginData | null>(
    null,
  );
  const [settingsData, setSettingsData] = useState<AdminSettingData | null>(
    null,
  );

  const [showQrLogin, setShowQrLogin] = useState(false);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [qrPolling, setQrPolling] = useState<NodeJS.Timeout | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
  } = useForm<LoginData>({
    resolver: zodResolver(
      loginAs === "customer" ? customerLoginSchema : agencyLoginSchema,
    ),
    context: { loginAs },
  });

  const check2FA = async (loginData: LoginData) => {
    setPendingLoginData(loginData);
    handleLogin(loginData);
  };

  const handleLogin = async (loginData: LoginData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await loginUser(loginData);

      if (response.data?.forceLogout) {
        setPopupMessage(
          response.data.message ||
            "Your account has been removed by the agency",
        );
        setLoading(false);
        return;
      }

      if (response.data.success) {
        showSuccessToast(response.data.message || "Login successful!");

        if (response.data.requiresSelection) {
          setAgenciesToSelect(response.data.agencies);
        } else {
          const { error: signInError, data: signInData } =
            await signIn(response);
          if (signInError) {
            setError(signInError.message || "Invalid credentials");
          } else {
            router.push(
              `/${
                signInData?.user?.role === "teamMember"
                  ? "agent"
                  : signInData?.user?.role
              }/dashboard`,
            );
          }
        }
      } else {
        setError(response.data.message || "An unknown error occurred.");
      }
    } catch (err) {
      const loinError = err as errorSchema;
      const errorMessage =
        loinError.response?.data?.message ||
        loinError.message ||
        "An unknown error occurred.";
      if (loinError.response?.data?.forceLogout) {
        setPopupMessage(
          loinError.response.data.message ||
            "Your account has been deleted by the agency.",
        );
      } else {
        setError(errorMessage);
      }
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

  const createQrSession = async () => {
    try {
      const res = await apiService.createQr();
      if (res.data?.success) {
        const token = res.data.token;
        setQrToken(token);

        // start polling
        const interval = setInterval(async () => {
          try {
            const status = await apiService.checkQrStatus(token);

            if (status.data?.success && status.data?.token) {
              clearInterval(interval);

              const { user, token: jwt } = status.data;

              completeSignIn(user, jwt);
            }

            if (status.data?.expired) {
              clearInterval(interval);
              setShowQrLogin(false);
              setQrToken(null);
              showErrorToast("QR expired. Please try again.");
            }
          } catch (err) {
            console.error("QR polling error", err);
          }
        }, 3000);

        setQrPolling(interval);
      }
    } catch (err) {
      console.error("QR create error", err);
    }
  };

  useEffect(() => {
    return () => {
      if (qrPolling) clearInterval(qrPolling);
    };
  }, [qrPolling]);

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
    if (!imageUrl) return;

    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }

    const baseUrl = process.env.NEXT_PUBLIC_IMAGE_URL as string;
    return `${baseUrl}/logo/medium/${imageUrl}`;
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4">
      <Link
        href="/"
        className="fixed top-4 left-4 text-[#0A2540] hover:text-[#0A2540]/80 font-medium transition-colors flex items-center gap-2 z-10">
        <ArrowLeftIcon className="h-4 w-4" />
        <span className="hidden sm:inline">Back to Home</span>
      </Link>

      <div className="max-w-md w-full bg-[#C9A24D]/20 rounded-xl shadow-sm md:p-8 p-6 border-1 border-[#C9A24D]">
        {/* Logo Section */}
        <div className="text-center mb-1">
          <div className="inline-flex flex-col items-center justify-center mb-2">
            {settingsData?.logoUrl ? (
              <div className="mb-4">
                <div className="overflow-hidden w-16 h-16 mx-auto ">
                  <Image
                    src={getImageUrl(settingsData.logoUrl) as string}
                    alt="Logo"
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                </div>
              </div>
            ) : (
              <div className="w-16 h-16 bg-[#0A2540] rounded-full flex items-center justify-center mb-4">
                <BuildingOffice2Icon className="h-8 w-8 text-white" />
              </div>
            )}
            <h1 className="text-2xl font-bold text-[#0A2540]">REAMS</h1>
            <p className="text-gray-600 text-sm mt-1">
              Real Estate Management System
            </p>
          </div>
        </div>

        {agenciesToSelect ? (
          // Agency Selection Screen
          <div className="space-y-4">
            <div className="relative mb-6 text-center">
              <button
                onClick={() => {
                  setAgenciesToSelect(null);
                  setLoginAs(null);
                  setShowQrLogin(false);
                  setQrToken(null);
                }}
                className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#0A2540] p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Go back">
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-semibold text-[#0A2540]">
                Select Your Agency
              </h2>
            </div>

            <div className="space-y-3">
              {agenciesToSelect.map((agency) => (
                <button
                  key={agency.customerId}
                  onClick={() => handleAgencySelection(agency.customerId)}
                  disabled={loading}
                  className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-[#0A2540] hover:bg-[#F5F7FA] transition-all duration-200 disabled:opacity-50">
                  <span className="font-medium text-[#0A2540]">
                    {agency.name}
                  </span>
                  <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        ) : !loginAs ? (
          // Role Selection Screen
          <div className="space-y-4">
            <h2 className="text-center text-lg font-semibold text-[#0A2540]">
              Sign in to your account
            </h2>

            <div className="space-y-4">
              <button
                onClick={() => handleRoleSelect("agency")}
                className="w-full flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-[#0A2540] hover:bg-[#F5F7FA] transition-all duration-200">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-[#0A2540] rounded-lg">
                  <BuildingOffice2Icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-[#0A2540]">Agency / Agent</p>
                  <p className="text-sm text-gray-600">
                    Manage your real estate business
                  </p>
                </div>
                <ChevronRightIcon className="h-5 w-5 text-gray-400" />
              </button>

              <button
                onClick={() => handleRoleSelect("customer")}
                className="w-full flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-[#0A2540] hover:bg-[#F5F7FA] transition-all duration-200">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-[#C9A24D] rounded-lg">
                  <UserIcon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-[#0A2540]">Customer</p>
                  <p className="text-sm text-gray-600">Find your dream home</p>
                </div>
                <ChevronRightIcon className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <div className="border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                Don&apos;t have an agency account?{" "}
                <Link
                  href="/auth/signup"
                  className="font-medium text-[#0A2540] underline">
                  Create one now
                </Link>
              </p>
            </div>

            <InstallButton isFrom="Login" />
          </div>
        ) : (
          // Login Form
          <>
            <div className="relative mb-6 text-center">
              <button
                onClick={() => setLoginAs(null)}
                className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#0A2540] p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Go back">
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-semibold text-[#0A2540]">
                Sign in as{" "}
                {loginAs === "agency"
                  ? "Agency"
                  : loginAs === "admin"
                    ? "Admin"
                    : "Customer"}
              </h2>
            </div>

            <form
              onSubmit={handleSubmit((data) => {
                if (loginAs === "agency" || loginAs === "admin") {
                  handleLogin(data);
                } else {
                  check2FA(data);
                }
              })}
              className="space-y-4">
              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
              {showQrLogin ? (
                <div className="text-center space-y-4">
                  {qrToken ? (
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${qrToken}`}
                      className="mx-auto w-[160px] h-[160px]"
                      alt="QR"
                    />
                  ) : (
                    <p className="text-sm text-gray-500">Generating QR...</p>
                  )}

                  <p className="text-sm text-gray-500">
                    Scan this QR using an already logged-in device
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setShowQrLogin(false);
                      setQrToken(null);
                      if (qrPolling) clearInterval(qrPolling);
                    }}
                    className="w-full bg-[#0A2540] text-white py-3 rounded-lg font-medium">
                    Login with Email instead
                  </button>
                </div>
              ) : (
                <>
                  {loginAs === "agency" || loginAs === "admin" ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-[#0A2540] mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <AtSymbolIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="email"
                            {...register("email")}
                            autoFocus
                            className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540] focus:border-[#0A2540] transition-colors ${
                              errors.email
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            placeholder="you@example.com"
                          />
                        </div>
                        {errors.email && (
                          <p className="text-red-600 text-xs mt-1.5">
                            {errors.email.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#0A2540] mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <LockClosedIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type={showPassword ? "text" : "password"}
                            {...register("password")}
                            className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540] focus:border-[#0A2540] transition-colors ${
                              errors.password
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            placeholder="Enter your password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-[#0A2540]">
                            {showPassword ? (
                              <EyeSlashIcon className="h-5 w-5" />
                            ) : (
                              <EyeIcon className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="text-red-600 text-xs mt-1.5">
                            {errors.password.message}
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-[#0A2540] mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <PhoneIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          {...register("phone")}
                          autoFocus
                          className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540] focus:border-[#0A2540] transition-colors ${
                            errors.phone ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="Enter your phone number"
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-red-600 text-xs mt-1.5">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}

              {!showQrLogin && (
                <>
                  {" "}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#0A2540] text-white py-3 rounded-lg font-medium hover:bg-[#0A2540]/90 focus:outline-none focus:ring-2 focus:ring-[#0A2540] focus:ring-offset-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed mb-0">
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing In...
                      </span>
                    ) : (
                      "Sign In"
                    )}
                  </button>
                  <div className="flex items-center gap-3 my-2">
                    <div className="flex-1 h-px bg-gray-300" />
                    <span className="text-xs text-gray-500">OR</span>
                    <div className="flex-1 h-px bg-gray-300" />
                  </div>
                  {/* QR Login Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowQrLogin(true);
                      createQrSession();
                    }}
                    className="w-full border border-[#0A2540] text-[#0A2540] py-3 rounded-lg font-medium hover:bg-[#F5F7FA]">
                    Login with QR Code
                  </button>{" "}
                </>
              )}
            </form>

            {/* Footer Links */}
            <div className="mt-2 text-center space-y-4">
              {(loginAs === "agency" || loginAs === "admin") && (
                <div>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-[#0A2540] hover:underline font-medium">
                    Forgot your password?
                  </Link>
                </div>
              )}

              <div className="text-sm text-gray-600 border-t border-gray-200">
                <span>Don&apos;t have an account? </span>
                <Link
                  href="/auth/signup"
                  className="font-medium text-[#0A2540] hover:underline">
                  Create Agency
                </Link>
              </div>
            </div>
          </>
        )}
      </div>

      {openOtpModal && (
        <OtpModal
          phone={getValues("phone")}
          onClose={() => setOpenOtpModal(false)}
          onSuccess={() => {
            setOpenOtpModal(false);
            if (pendingLoginData) {
              handleLogin(pendingLoginData);
            }
          }}
        />
      )}

      {popupMessage && (
        <InfoPopup
          message={popupMessage}
          onClose={() => setPopupMessage(null)}
        />
      )}
    </div>
  );
};
