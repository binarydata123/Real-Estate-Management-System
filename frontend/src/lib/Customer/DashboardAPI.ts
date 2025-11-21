import api from "../api";

export const customerDashboard =async () => {
  const res=await api.get("/customer/dashboard/dashborad-data");
  return res.data;
};
