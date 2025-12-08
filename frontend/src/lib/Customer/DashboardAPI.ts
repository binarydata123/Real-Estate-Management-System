import api from "../api";

export const customerDashboard =async () => {
  const res=await api.get("/customer/dashboard/dashboard-data");
  return res.data;
};
