import api from "../api";
const API_URL = "/common/settings";

export const getSettingsData = async () => {
    try {
        const response = await api.get(`${API_URL}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};