import api from "@/lib/api";
export const getConversations = async (params?: {
    archived?: boolean;
    deleted?: boolean;
    blocked?: boolean;
}) => {
    const queryParams: string[] = [];

    if (params?.archived) queryParams.push("archived=true");
    if (params?.deleted) queryParams.push("deleted=true");
    if (params?.blocked) queryParams.push("blocked=true");

    const queryString =
      queryParams.length > 0 ? `?${queryParams.join("&")}` : "";

    const response = await api.get(`/agent/messages/conversations${queryString}`);
    return response.data;
}

export const getConversationMessages = async (conversationId: string) => {
    const response = await api.get(`/agent/messages/conversations/${conversationId}`);
    return response.data;
}

export const startConversation = async (receiverId: string, body: any) => {
    const payload = {
        receiverId,
        ...(typeof body === "string" ? { message: body } : body),
    };

    const response = await api.post(`/agent/messages/conversations`, payload);
    return response.data;
}

export const markConversationAsRead = async (conversationId: string) => {
    const response = await api.patch(`/agent/messages/conversations/${conversationId}/read`);
    return response.data;
}

export const archiveConversation = async (conversationId: string) => {
    const response = await api.patch(`/agent/messages/conversations/${conversationId}/archive`);
    return response.data;
}
export const unArchiveConversation = async (conversationId: string) => {
    const response = await api.patch(`/agent/messages/conversations/${conversationId}/unarchive`);
    return response.data;
}
export const restoreConversation = async (conversationId: string) => {
    const response = await api.patch(`/agent/messages/conversations/${conversationId}/restore`);
    return response.data;
}
export const deleteConversation = async (conversationId: string) => {
    const response = await api.patch(`/agent/messages/conversations/${conversationId}/delete`);

    return response.data;
}

export const blockConversation = async (conversationId: string) => {
    const response = await api.patch(`/agent/messages/conversations/${conversationId}/block`);
    return response.data;
}
  

export const unblockConversation = async (conversationId: string) => {
    const response = await api.patch(`/agent/messages/conversations/${conversationId}/unblock`);
    return response.data;

}

export const sendMessage = async (conversationId: string, messageData: string, attachments: any[] = []) => {
    const response = await api.post(
        `/agent/messages/conversations/${conversationId}`,
        {
            receiverId: conversationId,
            content: messageData,
            attachments,
        },
        {
            headers: {
                "Content-Type": "application/json",
            },
        }
    );
    return response.data;
};
export const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("token");
    const response = await api.post(`/agent/messages/upload`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
}
export const getCustomers = async () => {
    const response = await api.get(`/agent/messages/get-customers`);
    return response.data;
}
