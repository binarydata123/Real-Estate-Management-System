import api from "@/lib/api";
const API_URL = "/agent/properties";

/**
 * Creates a new property.
 * @param propertyData - The property data from the form as FormData.
 */
export const createProperty = async (propertyData: FormData) => {
  try {
    const response = await api.post(API_URL + "/create", propertyData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getProperties = async (filters?: Record<string, any>) => {
  try {
    const response = await api.get(`${API_URL}/getProperties`, {
      params: filters || {},
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
