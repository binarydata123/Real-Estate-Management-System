import { AxiosResponse } from "axios";
import api from "../api";

export type NotificationType = {
  _id: string;
  userId: string;
  agencyId: string;
  message: string;
  type:
    | "welcome"
    | "new_lead"
    | "task_assigned"
    | "meeting_scheduled"
    | "property_updated"
    | "property_added";
  read: boolean;
  link: string;
  createdAt: string;
};

// Get all notifications for a user
export const getNotifications = async (
  userId: string,
  options?: {
    type:
      | "welcome"
      | "new_lead"
      | "task_assigned"
      | "meeting_scheduled"
      | "property_updated"
      | "property_added"
      | "unread"
    page?: number;
    limit?: number;
  },
): Promise<
  AxiosResponse<{
    success: boolean;
    data: [];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>
> => {
  const { type, page = 1, limit = 10 } = options || {};
  const result = await api.get(`/common/notification/get-by-user`, {
    params: { type, page, limit },
  });
  return result;
};

// Get unread notifications for a user
export const getUnreadNotificationsCount = async (): Promise<
  AxiosResponse<number>
> => {
  const result = await api.get(`/common/notification/get-unread-notifications`);
  return result.data;
};

// Mark a single notification as read
export const markAsRead = async (id: string): Promise<AxiosResponse> => {
  console.log(id)
  return api.patch(`/common/notification/mark-as-read/${id}`);
};

// Mark all notifications for a user as read
export const markAllAsRead = async (): Promise<AxiosResponse> => {
  return api.patch(`/common/notification/mark-all-read`);
};

// Delete a notification
export const deleteNotification = async (
  id: string,
): Promise<AxiosResponse> => {
  return api.delete(`/common/notification/delete/${id}`);
};
