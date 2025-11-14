import api from "@/lib/api";


export const getDashboardData=async() => {
    const res =await api.get("agent/dashboard/data");
    return res.data;
};
