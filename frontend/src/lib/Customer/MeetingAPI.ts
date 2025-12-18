import api from "../api";

// ✅ Get meeting by ID
export const getMeetingById = async (id: string) => {
  return await api.get(`/customer/meetings/getById/${id}`);
};

// ✅ Get all meetings
export const getMeetingsByCustomer = async (
  customerId: string,
  status: "upcoming" | "past" | "cancelled",
  page = 1,
  limit = 10,
) => {
  return await api.get(
    `/customer/meetings/get-all?customerId=${customerId}&status=${status}&page=${page}&limit=${limit}`,
  );
};

export const updateMeetingStatus = async(
  meetingId: string,
  payload: { status: string }
) => {
  return await api.put(`/customer/meetings/update-status/${meetingId}`, payload);
};


//update meeting (EDIT)

export const updateMeeting = async(
  id:string,
  data:{
    date?:string;
    time?:string;
    // propertyId?:string | null;
  }
) => {
  return await api.put(`/customer/meetings/update/${id}`,data);
}



