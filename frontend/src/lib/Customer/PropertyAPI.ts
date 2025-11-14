import api from "@/lib/api";
const API_URL = "/customer/properties";
/**
 * Creates a new property.
 * @param propertyData - The property data from the form as FormData.
 */

export const getSharedProperties = async (agencyId: string) => {
  const response = await api.get<sharePropertyResponse>(
    `/customer/properties/getAllSharedProperties`,
    {
      params: { agencyId },
    }
  );
  return response.data;
};

export const getProperties = async (
  filters?: Record<string, string | number>
) => {
  try {
    const response = await api.get(API_URL, {
      params: filters || {},
    });
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
};
