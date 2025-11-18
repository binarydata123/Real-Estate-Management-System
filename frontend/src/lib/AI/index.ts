import { showErrorToast } from "@/utils/toastHandler";
import api from "../api";

export const getAIPrompt = async (propertyId: string, userId: string) => {
  return await api.get(`/assistant/property-prompt/${propertyId}/${userId}`);
};

export const createAssistant = async (data: { prompt: string }) => {
  const response = await api.post(`/assistant/create`, data);
  return response.data;
};

export const createCustomerAssistant = async () => {
  const response = await api.post(`/assistant/create-customer-assistant`);
  return response.data;
};

// 🧠 Start session before logging messages
export const startPreferenceSession = async (data: {
  assistantId: string;
  userId: string;
  propertyId: string;
}) => {
  const response = await api.post(`/assistant/start-preference-session`, data);
  return response.data;
};

// 🧠 Log messages to the session
export const logAISessionMessage = async (data: {
  sessionId: string;
  role: "user" | "assistant";
  message: string;
}) => {
  try {
    await api.post("/assistant/log", data);
  } catch (error) {
    showErrorToast("⚠️ Error logging AI interaction:", error);
  }
};

export const startCustomerSession = async (data: { assistantId: string }) => {
  const response = await api.post(`/assistant/start-customer-session`, data);
  return response.data;
};

export const startPropertySession = async (data: { assistantId: string }) => {
  const response = await api.post(`/assistant/start-property-session`, data);
  return response.data;
};

export const startMeetingSession = async (data: {
  assistantId: string;
  userId: string;
}) => {
  const response = await api.post(`/assistant/start-meeting-session`, data);
  return response.data;
};
