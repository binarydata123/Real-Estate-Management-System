import api from "@/lib/api";
const API_URL = "/agent/properties";

/**
 * Creates a new property.
 * @param propertyData - The property data from the form as FormData.
 */
export const createProperty = async (propertyData: FormData) => {
  try {
    const response = await api.post(API_URL, propertyData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateProperty = async (id: string, propertyData: FormData) => {
  try {
    const response = await api.put(`${API_URL}/${id}`, propertyData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getSinglePropertyDetail = async (id: string) => {
  try {
    const response = await api.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const deleteProperty = async (id: string) => {
  try {
    const response = await api.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const getProperties = async (
  filters?: Record<string, string | number>
): Promise<{ data: Property[] }> => {
  try {
    const response = await api.get<{ data: Property[] }>(API_URL, {
      params: filters || {},
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
