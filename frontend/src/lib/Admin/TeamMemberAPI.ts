import api from "@/lib/api";
import { TeamMemberFormDataSchema } from "@/schemas/Admin/teamMembersSchema";

export const getTeamMembers = async (
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
  if (status) {
    params.status = status;
  }
  if (agencyId) {
    params.agencyId = agencyId;
  }
  const query = new URLSearchParams(params);
  const response = await api.get<TeamMemberResponse>(
    `/admin/team-members/get-all-team-members?${query.toString()}`,
  );
  return response.data;
};

export const updateCustomer = async (
  id: string,
  teamMemberData: Partial<TeamMemberFormDataSchema>,
) => {
  const response = await api.put<TeamMemberResponse>(
    `/admin/team-members/update/${id}`,
    teamMemberData,
  );
  return response;
};
export const deleteTeamMemberById = async (id: string) => {
  return await api.delete(`/admin/team-members/delete/${id}`);
};
