import api from "@/lib/api";
import { PropertyFormDataSchema } from "@/schemas/Admin/propertySchema";

export const getProperty = async (
  page?: number,
  limit?: string,
  search = "",
  status = "",
  agencyId = ""
) => {
  const params: Record<string, string> = {};
  if (page !== undefined) {
    params.page = page.toString();
  }
  if (limit !== undefined) {
    params.limit = limit.toString();
  }
  if (search) {
    params.search = search;
  }
  if(status) {
    params.status = status;
  }
  if (agencyId) { 
    params.agencyId = agencyId;
  }
  const query = new URLSearchParams(params);
  const response = await api.get<PropertyResponse>(
    `/admin/properties/get-all-properties?${query.toString()}`
  );
  return response.data;
};

export const updateProperty = async (
  id: string,
  propertyData: Partial<PropertyFormDataSchema>
) => {
  const response = await api.put<PropertyResponse>(
    `/admin/properties/update/${id}`,
    propertyData
  );
  return response;
};
export const deletePropertyById = async (id: string) => {
  return await api.delete(`/admin/properties/delete/${id}`);
};