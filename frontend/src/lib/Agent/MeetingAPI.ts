import { MeetingFormData } from "@/schemas/Agent/meetingSchema";
import api from "../api";

// ✅ Create meeting
export const createMeeting = async (meetingData: MeetingFormData) => {
  return await api.post(`/agent/meetings/create`, meetingData);
};
// ✅ Update meeting
export const updateMeeting = async (
  id: string,
  meetingData: Partial<MeetingFormData>
) => {
  return await api.put(`/agent/meetings/update/${id}`, meetingData);
};
export const updateMeetingStatus = async (id: string, status: string) => {
  return await api.put(`/agent/meetings/update-status/${id}`, { status });
};
// ✅ Get meeting by ID
export const getMeetingById = async (id: string) => {
  return await api.get(`/agent/meetings/getById/${id}`);
};
// ✅ Delete meeting
export const deleteMeeting = async (id: string) => {
  return await api.delete(`/agent/meetings/delete/${id}`);
};
// ✅ Get all meetings
// frontend API wrapper
// MeetingAPI.ts
export const getMeetingsByAgency = async (
  agencyId: string,
  status: "upcoming" | "past" | "cancelled",
  page = 1,
  limit = 10
) => {
  return await api.get(
    `/agent/meetings/get-all?status=${status}&page=${page}&limit=${limit}`
  );
};
