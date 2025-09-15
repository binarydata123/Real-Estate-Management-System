"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader } from 'lucide-react';
import { loginUser } from '@/lib/Authentication/RegistrationAPI';
import { AxiosError } from 'axios';

export const AUTH_SESSION_KEY = 'auth-session';

// --- Custom Auth Types ---
export interface User {
    id: string;
    name: string;
    email: string;
    agency?: { id: string };
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

    useEffect(() => {
        const checkSession = () => {
            try {
                const sessionStr = localStorage.getItem(AUTH_SESSION_KEY);
                if (sessionStr) {
                    const savedSession: Session = JSON.parse(sessionStr);
                    // NOTE: In a production app, you should verify the token with the backend here.
                    // For this project, we'll trust the localStorage session.
                    // The API interceptor will fail if the token is invalid.
                    setSession(savedSession);
                    setUser(savedSession.user);
                }
            } catch (error) {
                console.error("Failed to parse session from localStorage", error);
                localStorage.removeItem(AUTH_SESSION_KEY);
            } finally {
                setLoading(false);
            }
        };

        checkSession();
    }, []);


    useEffect(() => {
        const protectedRoutes = ['/admin', '/agent'];
        const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

        if (!loading && !user && isProtectedRoute) {
            router.push('/auth/login');
        }
    }, [user, loading, router, pathname]);

    const signIn = async (credentials: LoginData): Promise<AuthResponse> => {
        try {
            const response = await loginUser(credentials);
            const { token, user: apiUser, agency } = response.data;

            const user: User = {
                id: apiUser.id,
                name: apiUser.name,
                email: apiUser.email,
                agency: agency,
            };

            const newSession: Session = {
                access_token: token,
                user: user,
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
        setUser(null);
        setSession(null);
        localStorage.removeItem(AUTH_SESSION_KEY);
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