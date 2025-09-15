import axios from 'axios';
import { AUTH_SESSION_KEY, type Session } from '@/context/AuthContext';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

api.interceptors.request.use(
    (config) => {
        // This check ensures localStorage is accessed only on the client side.
        if (typeof window !== 'undefined') {
            try {
                const sessionStr = localStorage.getItem(AUTH_SESSION_KEY);
                if (sessionStr) {
                    const session: Session = JSON.parse(sessionStr);
                    if (session.access_token) {
                        config.headers.Authorization = `Bearer ${session.access_token}`;
                    }
                }
            } catch (error) {
                console.error("Could not get auth token from local storage", error);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;