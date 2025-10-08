import api from "@/lib/api";

export const getAllDashboardData = async () => {
  const response = await api.get<DashboardResponse>(
    `/admin/dashboard/get-all-dashboard-data`
  );
  return response.data;
};