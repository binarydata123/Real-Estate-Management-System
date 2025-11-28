"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import Cookies from "js-cookie";
import { checkSession as checkSessionApi } from "@/lib/Authentication/AuthenticationAPI";
import { AxiosError, AxiosResponse } from "axios";
import { showErrorToast } from "@/utils/toastHandler";
import { brandColor } from "@/types/global";
import { getAgencySettings } from "@/lib/Agent/SettingsAPI";

export const AUTH_SESSION_KEY = "auth-session";
export const ROLE_FOR_MIDDELEWARE = "role-for-middleware";

export interface Agency {
  _id: string;
  name: string;
  slug: string;
  email: string;
  phone: string;
  logoUrl?: string;
  owner: string;
}

// --- Custom Auth Types ---
export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  showAllProperty: boolean;
  agency?: Agency;
}

export interface Session {
  access_token: string;
}

export type AuthResponse = {
  data: { user: User | null; session: Session | null };
  error: { message: string } | null;
};

// --- End Custom Auth Types ---

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (response: AxiosResponse) => Promise<AuthResponse>;
  completeSignIn: (user: User, token: string) => void;
  signOut: () => Promise<void>;
  router: ReturnType<typeof useRouter>;
  setBrandingColor: (value: brandColor) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [brandColors, setBrandingColor] = useState<brandColor>()
  const router = useRouter();


  // Centralized function to clear session state and storage
  const clearSession = useCallback(() => {
    setUser(null);
    setSession(null);
    Cookies.remove(AUTH_SESSION_KEY);
    Cookies.remove(ROLE_FOR_MIDDELEWARE);
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionStr = Cookies.get(AUTH_SESSION_KEY);
        if (sessionStr) {
          const savedSession: Session = JSON.parse(sessionStr);

          // Verify session with the backend. The user object is nested in response.data.data.user
          const response = await checkSessionApi(savedSession.access_token);
          const freshUser = response.data.data.user;

          // Update user data from the fresh backend response
          const newSession: Session = {
            ...savedSession,
          };

          setSession(newSession);
          setUser(freshUser);
          Cookies.set(AUTH_SESSION_KEY, JSON.stringify(newSession), {
            expires: 365, // Keep user logged in for 1 year
            secure: process.env.NODE_ENV === "production",
          });
          Cookies.set(ROLE_FOR_MIDDELEWARE, freshUser.role);
        } else {
          // If no session is in storage, ensure state is cleared.
          clearSession();
        }
      } catch (error) {
        showErrorToast("Session check failed, signing out.", error);
        clearSession();
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, [clearSession]);
  const signIn = async (response: AxiosResponse): Promise<AuthResponse> => {
    try {
      const { token, user: userData } = response.data;

      const newSession: Session = {
        access_token: token,
      };

      setSession(newSession);
      setUser(userData);
      Cookies.set(AUTH_SESSION_KEY, JSON.stringify(newSession), {
        expires: 365, // Keep user logged in for 1 year
        secure: process.env.NODE_ENV === "production",
      });
      Cookies.set(ROLE_FOR_MIDDELEWARE, userData.role);
      return { data: { user: userData, session: newSession }, error: null };
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message ||
        "An unknown error occurred during sign-in.";
      return {
        data: { user: null, session: null },
        error: { message: errorMessage },
      };
    }
  };

  const completeSignIn = (userData: User, token: string) => {
    const newSession: Session = {
      access_token: token,
    };

    setSession(newSession);
    setUser(userData);
    Cookies.set(AUTH_SESSION_KEY, JSON.stringify(newSession), {
      expires: 365,
      secure: process.env.NODE_ENV === "production",
    });
    Cookies.set(ROLE_FOR_MIDDELEWARE, userData.role);
    router.push(`/${userData.role}/dashboard`);
  };
  const getSettings = async () => {
    try {
      const res = await getAgencySettings();
      setBrandingColor(res.branding);
    } catch (error) {
      showErrorToast("Error", error);
    }
  }

  useEffect(() => {
    getSettings();
  }, [])
  useEffect(() => {
    document.documentElement.style.setProperty("--primary", brandColors?.primaryColor || "#1e41f1");
  }, [brandColors, user]);

  const signOut = async () => {
    clearSession();
    router.push("/auth/login");
  };

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      signIn,
      completeSignIn,
      signOut,
      router,
      setBrandingColor
    }),
    [user, session, loading, router, signIn, completeSignIn]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
