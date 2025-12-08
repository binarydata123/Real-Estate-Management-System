import api from "@/lib/api";
import { MeetingFormDataSchema } from "@/schemas/Admin/meetingSchema";

export const getMeetings = async (
  page?: number,
  limit?: string,
  search = "",
  status = "",
  agencyId = "",
) => {
  const params: Record<string, string> = {};
  if (page !== undefined) {
    params.page = page.toString();
  }
  if (limit !== undefined) {
    params.limit = limit.toString();
  }
  if (search) {
    params.search = search;
  }
  if ( status) {
    params.status = status;
  }
  if (agencyId) {
    params.agencyId = agencyId;
  }
  const query = new URLSearchParams(params);
  const response = await api.get<MeetingResponse>(
    `/admin/meetings/get-all-meetings?${query.toString()}`,
  );
  return response.data;
};

export const updateMeeting = async (
  id: string,
  meetingData: Partial<MeetingFormDataSchema>,
) => {
  const response = await api.put<MeetingResponse>(
    `/admin/meetings/update/${id}`,
    meetingData,
  );
  return response;
};
export const deleteMeetingById = async (id: string) => {
  return await api.delete(`/admin/meetings/delete/${id}`);
};
