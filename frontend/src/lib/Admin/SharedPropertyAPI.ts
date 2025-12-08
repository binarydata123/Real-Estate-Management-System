import api from "@/lib/api";
import { SharedFormDataSchema } from "@/schemas/Admin/sharedPropertySchema";

export const getSharedProperties = async (
  page?: number,
  limit?: string,
  search = "",
  status = "",
  agencyId = "",
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
  if ( status) {
    params.status = status;
  }
  if (agencyId) {
    params.agencyId = agencyId;
  }
  const query = new URLSearchParams(params);
  const response = await api.get<sharePropertyResponse>(
    `/admin/shared-properties/get-all-shared-properties?${query.toString()}`,
  );
  return response.data;
};

export const updateSharedProperties = async (
  id: string,
  sharedPropertyData: Partial<SharedFormDataSchema>,
) => {
  const response = await api.put<MeetingResponse>(
    `/admin/shared-properties/update/${id}`,
    sharedPropertyData,
  );
  return response;
};
export const deleteSharedPropertiesById = async (id: string) => {
  return await api.delete(`/admin/shared-properties/delete/${id}`);
};

export const getPropertyFeedbackByPropertyId = async (
  propertyShareId?: string
) => {
  const response = await api.get(`/admin/shared-properties/get-property-feedback-by-property-id/${propertyShareId}`);
  return response.data;
};