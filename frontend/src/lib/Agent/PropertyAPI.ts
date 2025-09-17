import api from "@/lib/api";
const API_URL = '/agent/properties';

/**
 * Creates a new property.
 * @param propertyData - The property data from the form as FormData.
 */
export const createProperty = async (propertyData: FormData) => {
    try {
        const response = await api.post(API_URL + '/create', propertyData);
        return response.data;
    } catch (error) {
        throw error;
    }
};
