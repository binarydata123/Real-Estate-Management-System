import axios from 'axios';
import Cookies from 'js-cookie';
import { AUTH_SESSION_KEY, type Session } from '@/context/AuthContext';
import { showErrorToast } from '@/utils/toastHandler';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        // For file uploads, let the browser set the Content-Type header.
        if (config.data instanceof FormData) {
            config.headers['Content-Type'] = 'multipart/form-data';
        }
        if (typeof window !== 'undefined') {
            try {
                // get from cocky
                const sessionStr = Cookies.get(AUTH_SESSION_KEY);
                if (sessionStr) {
                    const session: Session = JSON.parse(sessionStr);
                    if (session.access_token) {
                        config.headers.Authorization = `Bearer ${session.access_token}`;
                    }
                }
            } catch (error) {
                showErrorToast("Could not get auth token from local storage", error);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

export default api;
