import api from "@/lib/api";

export const getAllAnalyticsData = async () => {
  const response = await api.get<AnalyticsResponse>(
    `/admin/analytics/get-all-analytics-data`,
  );
  return response.data;
};
