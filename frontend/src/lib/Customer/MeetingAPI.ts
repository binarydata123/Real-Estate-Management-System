import api from "../api";



// ✅ Get meeting by ID
export const getMeetingById = async (id: string) => {
  return await api.get(`/customer/meetings/getById/${id}`);
};

// ✅ Get all meetings
// MeetingAPI.ts
export const getMeetingsByCustomer = async (
  customerId: string,
  status: "upcoming" | "past" | "cancelled",
  page = 1,
  limit = 10
) => {
  return await api.get(
    `/customer/meetings/get-all?customerId=${customerId}&status=${status}&page=${page}&limit=${limit}`
  );
};

