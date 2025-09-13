import axios from 'axios';
import { Session, AUTH_SESSION_KEY } from '@/context/AuthContext';

/**
 * The base URL for your backend API.
 * It's configured to use an environment variable, which is a best practice.
 * - In development, you can set NEXT_PUBLIC_API_URL in a `.env.local` file
 *   (e.g., NEXT_PUBLIC_API_URL=http://localhost:5001/api).
 * - In production, it defaults to `/api`, assuming your backend serves the frontend
 *   and proxies API requests.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Axios request interceptor to automatically add the JWT from the user's
 * session to the Authorization header for every outgoing request.
 *
 * This assumes the session is stored in localStorage.
 */
api.interceptors.request.use(
    (config) => {
        // This code should only run in the browser
        if (typeof window !== 'undefined') {
            try {
                const sessionString = localStorage.getItem(AUTH_SESSION_KEY);

                if (sessionString) {
                    const session: Session = JSON.parse(sessionString);
                    if (session.access_token) {
                        config.headers.Authorization = `Bearer ${session.access_token}`;
                    }
                }
            } catch (error) {
                console.error('Could not get auth token from localStorage', error);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;