import api from "../api";

export const getAIPrompt = async (propertyId: string, userId: string) => {
    return await api.get(`/assistant/property-prompt/${propertyId}/${userId}`);
};