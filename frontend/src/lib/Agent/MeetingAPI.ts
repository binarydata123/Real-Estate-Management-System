import { MeetingFormData } from "@/schemas/Agent/meetingSchema";
import api from "../api";

// ✅ Create meeting
export const createMeeting = async (meetingData: MeetingFormData) => {
  return await api.post(`/agents/meetings/create`, meetingData);
};
// ✅ Update meeting
export const updateMeeting = async (
  id: string,
  meetingData: Partial<MeetingFormData>
) => {
  return await api.put(`/agents/meetings/update/${id}`, meetingData);
};
export const updateMeetingStatus = async (id: string, status: string) => {
  return await api.put(`/agents/meetings/update-status/${id}`, { status });
};
// ✅ Get meeting by ID
export const getMeetingById = async (id: string) => {
  return await api.get(`/agents/meetings/getById/${id}`);
};
// ✅ Delete meeting
export const deleteMeeting = async (id: string) => {
  return await api.delete(`/agents/meetings/delete/${id}`);
};
// ✅ Get all meetings
export const getMeetingsByAgency = async (
  agencyId: string,
  page = 1,
  limit = 10
) => {
  return await api.get(
    `/agents/meetings/get-all/${agencyId}?page=${page}&limit=${limit}`
  );
};
