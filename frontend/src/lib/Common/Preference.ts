import { UserPreferenceFormData } from "@/schemas/Agent/userPreferenceSchema";
import api from "../api";
const API_URL = "/common/preferences";

/**
 * Creates a new preference.
 * @param preferenceData - The preference data from the form as FormData.
 */

export const createPreference = async (preferenceData: UserPreferenceFormData) => {
    try {
        const response = await api.post(API_URL, preferenceData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getPreferenceDetail = async (id: string) => {
    try {
        const response = await api.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const sendRequestToCustomer = async (id: string) => {
    try {
        const response = await api.post(`${API_URL}/request-to-customer/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
