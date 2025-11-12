import { AxiosResponse } from 'axios';
import api from '../api';
import { LoginData } from '@/components/Auth/LoginForm';

/**
 * Registers a new agency and its first user.
 * This function does not require an active session.
 *
 * @param data The registration data for the new agency and user.
 * @returns A promise that resolves with the server's response.
 */
export const registerAgency = async (data: RegistrationData): Promise<AxiosResponse> => {
    return api.post('/auth/register-agency', data);
};

export const loginUser = async (data: LoginData): Promise<AxiosResponse> => {
    return api.post('/auth/login', data);
};

export const selectCustomerAgency = async (customerId: string): Promise<AxiosResponse> => {
    return api.post('/auth/select-customer-agency', { customerId });
};

export const checkSession = async (token: string): Promise<AxiosResponse> => {
    return api.get('/auth/check-session', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};
