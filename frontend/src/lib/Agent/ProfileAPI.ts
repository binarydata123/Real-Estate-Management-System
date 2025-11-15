import api from "@/lib/api";



export const getAgentProfile = async (): Promise<ApiResponse<AgentProfile>> => {
  const res = await api.get<ApiResponse<AgentProfile>>("/agent/profile");
  return res.data;
};

export const updateAgentProfile = async (
  data: AgentProfileFormData,
): Promise<ApiResponse<AgentProfile>> => {
  const res = await api.post<ApiResponse<AgentProfile>>("/agent/profile/update", data);
  return res.data;
};
