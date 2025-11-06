import api from "@/lib/api";
export interface AgencySettingsResponse {
  success: boolean;
  message: string;
  data: AgencySettingsType;
}
export const updateAgencySettings = async (
  data: AgencySettingsType | undefined
) => {
  const res = await api.post<AgencySettingsResponse>(
    `/agent/agency-settings/update-settings`,
    data
  );
  return res.data.data;
};

export const getAgencySettings = async () => {
  const response = await api.get<AgencySettingsResponse>(
    `/agent/agency-settings/get-settings`
  );
  return response.data.data;
};
