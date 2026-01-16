import api from "@/lib/api";

export const getAgentProfile = async (
  id: string
): Promise<ApiResponse<AgentProfile>> => {
  const res = await api.get<ApiResponse<AgentProfile>>("/agent/profile", {
    params: { id },
  });
  return res.data;
};

export const updateAgentProfile = async (
  data: AgentProfileFormData,
  id: string
): Promise<ApiResponse<AgentProfile>> => {
  const res = await api.post<ApiResponse<AgentProfile>>(
    "/agent/profile/update",
    data,
    {
      params: { id },
    }
  );
  return res.data;
};
