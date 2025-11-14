import api from "@/lib/api";
import { AgencyFormDataSchema } from "@/schemas/Admin/agencySchema";

export const getAgencies = async (
  page?: number,
  limit?: string,
  search = "",
  status = "",
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
  if (status) {
    params.status = status;
  }
  const query = new URLSearchParams(params);
  const response = await api.get<AgencyResponse>(
    `/admin/agency/get-all-agencies?${query.toString()}`,
  );
  return response.data;
};

export const updateAgency = async (
  id: string,
  agencyData: Partial<AgencyFormDataSchema>,
) => {
  const response = await api.put<AgencyResponse>(
    `/admin/agency/update/${id}`,
    agencyData,
  );
  return response;
};
export const deleteAgencyById = async (id: string) => {
  return await api.delete(`/admin/agency/delete/${id}`);
};
