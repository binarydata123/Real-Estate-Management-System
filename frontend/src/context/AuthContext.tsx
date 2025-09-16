"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader } from 'lucide-react';
import { loginUser, checkSession as checkSessionApi } from '@/lib/Authentication/AuthenticationAPI';
import { AxiosError } from 'axios';

export const AUTH_SESSION_KEY = 'auth-session';

export interface Agency {
    _id: string;
    name: string;
    slug: string;
    email: string;
    phone: string;
    logoUrl?: string;
}

// --- Custom Auth Types ---
export interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    agency?: Agency;
}

export interface Session {
    access_token: string;
    user: User;
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
    signIn: (credentials: LoginData) => Promise<AuthResponse>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
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
    const router = useRouter();
    const pathname = usePathname();

    // Centralized function to clear session state and storage
    const clearSession = useCallback(() => {
        setUser(null);
        setSession(null);
        localStorage.removeItem(AUTH_SESSION_KEY);
    }, []);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const sessionStr = localStorage.getItem(AUTH_SESSION_KEY);
                if (sessionStr) {
                    const savedSession: Session = JSON.parse(sessionStr);

                    // Verify session with the backend to ensure it's still valid
                    const { data: { user: freshUser } } = await checkSessionApi(savedSession.access_token);

                    // Update user data from backend response
                    const newSession: Session = {
                        ...savedSession,
                        user: freshUser
                    };

                    setSession(newSession);
                    setUser(freshUser);
                    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(newSession));
                } else {
                    // If no session is in storage, ensure state is cleared.
                    clearSession();
                }
            } catch (error) {
                console.error("Session check failed, signing out.", error);
                clearSession();
            } finally {
                setLoading(false);
            }
        };
        checkSession();
    }, [clearSession]);


    useEffect(() => {
        const protectedRoutes = ['/admin', '/agent'];
        const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

        if (!loading && !user && isProtectedRoute) {
            router.push('/auth/login');
        }
    }, [user, loading, router, pathname]);

    const signIn = async (credentials: LoginData): Promise<AuthResponse> => {
        try {
            // The backend now returns a consistent user object on login
            const response = await loginUser(credentials);
            const { token, user } = response.data;

            const newSession: Session = {
                access_token: token,
                user: user, // The user object from the API now matches the User interface
            };

            setSession(newSession);
            setUser(user);
            localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(newSession));

            return { data: { user, session: newSession }, error: null };
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || 'An unknown error occurred during sign-in.';
            return { data: { user: null, session: null }, error: { message: errorMessage } };
        }
    };

    const signOut = async () => {
        clearSession();
        router.push('/auth/login');
    };

    const value = {
        user,
        session,
        loading,
        signIn,
        signOut,
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};