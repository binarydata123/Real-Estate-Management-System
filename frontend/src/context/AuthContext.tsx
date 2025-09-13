"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader } from 'lucide-react';

export const AUTH_SESSION_KEY = 'auth-session';

// --- Local Types to replace Supabase ---
export interface User {
    id: string;
    email?: string;
    app_metadata: {
        provider?: string;
        [key: string]: any;
    };
    user_metadata: {
        [key: string]: any;
    };
    aud: string;
    created_at: string;
}

export interface Session {
    access_token: string;
    refresh_token: string;
    user: User;
    token_type: string;
    expires_in: number;
    expires_at?: number;
}

export type SignInWithPasswordCredentials = Record<string, any>;
export type AuthTokenResponsePassword = { data: { user: User | null; session: Session | null }; error: any };
// --- End Local Types ---

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signIn: (credentials: SignInWithPasswordCredentials) => Promise<AuthTokenResponsePassword>;
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
        const mockUser: User = {
            id: 'demo-user-id',
            email: 'demo@example.com',
            app_metadata: { provider: 'email' },
            user_metadata: { name: 'Demo User' },
            aud: 'authenticated',
            created_at: new Date().toISOString(),
        };
        const mockSession: Session = {
            access_token: 'demo-access-token',
            refresh_token: 'demo-refresh-token',
            user: mockUser,
            token_type: 'bearer',
            expires_in: 3600,
            expires_at: Math.floor(Date.now() / 1000) + 3600,
        };
        setUser(mockUser);
        setSession(mockSession);
        localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(mockSession));
        setLoading(false);
    }, []);


    useEffect(() => {
        const protectedRoutes = ['/admin', '/agent'];
        const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

        if (!loading && !user && isProtectedRoute) {
            router.push('/auth/login');
        }
    }, [user, loading, router, pathname]);

    const signIn = async (credentials: SignInWithPasswordCredentials) => {
        // Mock sign-in for frontend development
        if (user && session) {
            // Return a success-like response. The LoginForm will handle the redirect.
            return { data: { user, session }, error: null };
        }
        // This part should ideally not be reached if the mock is set up correctly.
        return { data: { user: null, session: null }, error: { name: 'MockAuthError', message: 'Mock user not found' } as any };
    };

    const signOut = async () => {
        console.log('Mock sign out');
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