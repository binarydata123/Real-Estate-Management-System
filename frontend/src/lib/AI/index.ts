import api from "../api";

export const getAIPrompt = async (propertyId: string, userId: string) => {
  return await api.get(`/assistant/property-prompt/${propertyId}/${userId}`);
};

export const createAssistant = async (data: { prompt: string }) => {
  const response = await api.post(`/assistant/create`, data);
  return response.data;
};

export const logAIInteraction = async (data: {
  userId: string;
  propertyId: string;
  assistantId: string;
  role: "user" | "assistant";
  message: string;
}) => {
  try {
    const response = await api.post("/assistant/log", data);
    return response.data;
  } catch (error) {
    console.error("⚠️ Error logging AI interaction:", error);
    throw error;
  }
};
