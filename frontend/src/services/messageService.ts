import { showErrorToast } from "@/utils/toastHandler";
import apiService from "./api";

// Get all conversations
export const getConversations = async (params?: {
  archived?: boolean;
  deleted?: boolean;
  blocked?: boolean;
}) => {
  try {
    const response = await apiService.getConversations(params);
    return (
      response.data?.data ?? {
        conversations: [],
        archiveCount: 0,
        deletedCount: 0,
      }
    );
  } catch (error) {
    showErrorToast("Error fetching conversations:", error);
    throw error;
  }
};

// Get messages for a specific conversation
export const getConversationMessages = async (conversationId: string) => {
  try {
    const response = await apiService.getConversationMessages(conversationId);
    return response.data?.data;
  } catch (error) {
    showErrorToast("Error fetching conversation messages:", error);
    throw error;
  }
};

// Send a message in a conversation
export const sendMessage = async (
  conversationId: string,
  content: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attachments?: any[]
) => {
  try {
    const response = await apiService.sendMessage(conversationId, {
      content,
      attachments,
    });
    return response;
  } catch (error) {
    showErrorToast("Error sending message:", error);
    throw error;
  }
};

// Start a new conversation
export const startConversation = async (
  receiverId: string,
  content: string,
  applicationId: string | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attachments?: any[]
) => {
  try {
    const response = await apiService.startConversation(receiverId, {
      content,
      attachments,
      applicationId,
    });
    return response;
  } catch (error) {
    showErrorToast("Error starting conversation:", error);
    throw error;
  }
};

// Mark a conversation as read
export const markConversationAsRead = async (conversationId: string) => {
  try {
    const response = await apiService.markConversationAsRead(conversationId);
    return response;
  } catch (error) {
    showErrorToast("Error marking conversation as read:", error);
    throw error;
  }
};

// Archive a conversation
export const archiveConversation = async (conversationId: string) => {
  try {
    const response = await apiService.archiveConversation(conversationId);
    return response;
  } catch (error) {
    showErrorToast("Error archiving conversation:", error);
    throw error;
  }
};
// Unarchive a conversation
export const unArchiveConversation = async (conversationId: string) => {
  try {
    const response = await apiService.unArchiveConversation(conversationId);
    return response;
  } catch (error) {
    showErrorToast("Error archiving conversation:", error);
    throw error;
  }
};
// Delete a conversation
export const deleteConversation = async (conversationId: string) => {
  try {
    const response = await apiService.deleteConversation(conversationId);
    return response;
  } catch (error) {
    showErrorToast("Error archiving conversation:", error);
    throw error;
  }
};
//Restore a conversation
export const restoreConversation = async (conversationId: string) => {
  try {
    const res = await apiService.restoreConversation(conversationId);
    return res;
  } catch (error) {
    showErrorToast("Error restoring conversation:", error);
  }
};
// Block a conversation
export const blockConversation = async (conversationId: string) => {
  try {
    const response = await apiService.blockConversation(conversationId);
    return response;
  } catch (error) {
    showErrorToast("Error archiving conversation:", error);
    throw error;
  }
};
// UnBlock a conversation
export const unblockConversation = async (conversationId: string) => {
  try {
    const response = await apiService.unblockConversation(conversationId);
    return response;
  } catch (error) {
    showErrorToast("Error archiving conversation:", error);
    throw error;
  }
};
export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const token = localStorage.getItem("auth_token");

  try {
    const response = await fetch(`${apiService.getBaseURL()}/messages/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) {
      const errorText = await response.text();
      showErrorToast("Server response:", errorText);
      throw new Error(`Upload failed with status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    showErrorToast("Upload error:", error);
    throw error;
  }
};
