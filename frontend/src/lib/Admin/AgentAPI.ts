import api from "@/lib/api";
import { AgentFormDataSchema } from "@/schemas/Admin/agentSchema";

export const getAgents = async (
  page?: number,
  limit?: string,
  search = "",
  status = ""
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
  const query = new URLSearchParams(params);
  const response = await api.get<AgentResponse>(
    `/admin/agents/get-all-agents?${query.toString()}`
  );
  return response.data;
};

export const updateCustomer = async (
  id: string,
  agentData: Partial<AgentFormDataSchema>
) => {
  const response = await api.put<AgentResponse>(
    `/admin/agents/update/${id}`,
    agentData
  );
  return response;
};
export const deleteAgentById = async (id: string) => {
  return await api.delete(`/admin/agents/delete/${id}`);
};