import { AxiosResponse } from 'axios';
import api from '../api';

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
