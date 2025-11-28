/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, useMemo } from "react";
//import { useSearchParams } from "react-router-dom";
import MessageThread from "./MessageThread/MessageThread";
import { Conversation, Message } from "./types/messageTypes";
import { useAuth } from "@/context/AuthContext";
import {
  getConversations,
  getConversationMessages,
  archiveConversation,
  blockConversation,
  deleteConversation,
  markConversationAsRead,
  restoreConversation,
  sendMessage,
  unArchiveConversation,
  unblockConversation,
  uploadFile,
  startConversation,
} from "@/lib/Customer/MessagesAPI";
import { io } from "socket.io-client";
import { showErrorToast } from "@/utils/toastHandler";
import ErrorDisplay from "@/components/Agent/Messages/UI/ErrorDisplay";

const Messages: React.FC = () => {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [newMessage, setNewMessage] = useState("");
  const [anotherUserAllowMessage, setAnotherUserAllowMessage] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isSelectingConversation, setIsSelectingConversation] = useState(true);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(true);
  const [errors, setErrors] = useState<any | null>(null);

  const socket = useMemo(() => {
    return io(process.env.NEXT_PUBLIC_BACKEND_URL, {
      withCredentials: true,
    });
  }, []);
  useEffect(() => {
    // Join room
    if (!selectedConversation) return;
    socket.emit("join_conversation", selectedConversation);

    // Live updates from socket
    socket.on("messages_update", (conversationId: string) => {
      fetchConversationMessages(conversationId);
    });

    // Cleanup listener on unmount
    return () => {
      socket.off("messages_update");
    };
  }, [selectedConversation]);

  // Fetch conversations on component mount
  useEffect(() => {
    fetchConversations();
  }, [user]);

  // Fetch messages when a conversation is selected
  useEffect(() => {
    if (!selectedConversation) return;
    fetchConversationMessages(selectedConversation);
    markAsRead(selectedConversation);
  }, [selectedConversation]);

  const fetchConversations = async (priorityConversationId?: string) => {
    try {
      // eslint-disable-next-line no-shadow
      const { conversations } = await getConversations();
      //setAllowMessage(allowMessages);
      setConversations(Array.isArray(conversations) ? conversations : []);

      if (priorityConversationId) {
        setSelectedConversation(priorityConversationId);
      } else if (conversations.length > 0 && !selectedConversation) {
        setSelectedConversation(conversations[0]._id);
      }
      if (conversations.length === 0) {
        // Start new conversation if conversation not started at
        setIsLoadingMessages(false);
        startNewConversation(user?.agency?.owner as string);
      }
    } catch (error) {
      showErrorToast("Error fetching conversations:", error);
    } finally {
      setIsSelectingConversation(false);
    }
  };

  const fetchConversationMessages = async (conversationId: string) => {
    try {
      const data = await getConversationMessages(conversationId);
      setMessages((prev) => ({
        ...prev,
        [conversationId]: data.messages,
      }));
      setAnotherUserAllowMessage(data.allowMessages);
      setShowProfile(data.showProfile);
    } catch (error) {
      showErrorToast("Error fetching messages:", error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const startNewConversation = async (agencyId: string) => {
    try {
      const messageText = ""

      const data = await startConversation(agencyId, {
        content: messageText,
      });

      if (data.success) {
        const newConversationId = data.data.conversationId;
        setSelectedConversation(newConversationId);
        fetchConversations(newConversationId);
      } else {
        if (
          typeof data.error === "string" &&
          data.error.includes("Not enough tokens")
        ) {
          setErrors(<>{data.error} </>);
        } else {
          setErrors("Failed to start conversation.");
        }
      }
    } catch (error: any) {
      showErrorToast("Error starting new conversation:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        "An unexpected error occurred.";
      setErrors(errorMessage);
    }
  };

  const markAsRead = async (conversationId: string) => {
    try {
      await markConversationAsRead(conversationId);

      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === conversationId
            ? {
              ...conv,
              unreadCount: {
                ...conv.unreadCount,
                [user?._id as string]: 0,
              },
            }
            : conv
        )
      );

      setMessages((prev) => ({
        ...prev,
        [conversationId]:
          prev[conversationId]?.map((msg) =>
            msg.receiverId === user?._id ? { ...msg, isRead: true } : msg
          ) || [],
      }));
    } catch (error) {
      showErrorToast("Error marking conversation as read:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) return;

    setIsSendingMessage(true);
    try {
      const attachments = [];

      if (selectedFile) {
        const uploadRes = await uploadFile(selectedFile);
        if (uploadRes.success && uploadRes.file) {
          attachments.push(uploadRes.file);
        } else {
          throw new Error("File upload failed or response missing data");
        }
      }

      if (newMessage.trim() || attachments.length > 0) {
        const response = await sendMessage(
          selectedConversation as string,
          newMessage,
          attachments
        );

        if (response.success && response.data?.message) {
          socket.emit("send_message", selectedConversation);
          if (typeof selectedConversation === "string") {
            setMessages((prev) => ({
              ...prev,
              [selectedConversation]: [
                ...(prev[selectedConversation] || []),
                response.data.message,
              ],
            }));
          }

          setConversations((prev) =>
            prev.map((conv) =>
              conv._id === selectedConversation
                ? {
                  ...conv,
                  lastMessage: newMessage || "📎 Attachment",
                  lastMessageAt: new Date().toISOString(),
                }
                : conv
            )
          );
        }
      }

      setNewMessage("");
      setSelectedFile(null);
      setFilePreview(null);
    } catch (error) {
      showErrorToast("Error sending message or uploading file:", error);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleArchiveConversation = async (conversationId: string) => {
    try {
      await archiveConversation(conversationId);
      setConversations((prevConversations) => {
        if (selectedConversation === conversationId) {
          const nextConversation = prevConversations.find(
            (conversation: Conversation) => conversation._id !== conversationId
          );
          setSelectedConversation(nextConversation?._id || null);
        }
        return prevConversations.filter(
          (conversation: Conversation) => conversation._id !== conversationId
        );
      });
    } catch (error) {
      showErrorToast("Error archiving conversation:", error);
    }
  };

  const handleUnarchiveConversation = async (conversationId: string) => {
    try {
      await unArchiveConversation(conversationId);
      setConversations((prevConversations) => {
        if (selectedConversation === conversationId) {
          const nextConversation = prevConversations.find(
            (conversation: Conversation) => conversation._id !== conversationId
          );
          setSelectedConversation(nextConversation?._id || null);
        }
        return prevConversations.filter(
          (conversation: Conversation) => conversation._id !== conversationId
        );
      });
    } catch (error) {
      showErrorToast("Error unarchiving conversation:", error);
    }
  };

  const handleRestoreConversation = async (conversationId: string) => {
    try {
      await restoreConversation(conversationId);
      setConversations((prevConversations) => {
        if (selectedConversation === conversationId) {
          const nextConversation = prevConversations.find(
            (conversation: Conversation) => conversation._id !== conversationId
          );
          setSelectedConversation(nextConversation?._id || null);
        }
        return prevConversations.filter(
          (conversation: Conversation) => conversation._id !== conversationId
        );
      });
    } catch (err) {
      showErrorToast("Error restoring conversation: ", err);
    }
  };

  const handleUnblockConversation = async (conversationId: string) => {
    try {
      await unblockConversation(conversationId);
      setConversations((prevConversations) => {
        if (selectedConversation === conversationId) {
          const nextConversation = prevConversations.find(
            (conversation: Conversation) => conversation._id !== conversationId
          );
          setSelectedConversation(nextConversation?._id || null);
        }
        return prevConversations.filter(
          (conversation: Conversation) => conversation._id !== conversationId
        );
      });
    } catch (error) {
      showErrorToast("Error unblocking conversation:", error);
    }
  };

  const handleBlockConversation = async (conversationId: string) => {
    try {
      await blockConversation(conversationId);
      setConversations((prevConversations) => {
        if (selectedConversation === conversationId) {
          const nextConversation = prevConversations.find(
            (conversation: Conversation) => conversation._id !== conversationId
          );
          setSelectedConversation(nextConversation?._id || null);
        }
        return prevConversations.filter(
          (conversation: Conversation) => conversation._id !== conversationId
        );
      });
    } catch (error) {
      showErrorToast("Error blocking conversation:", error);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await deleteConversation(conversationId);
      setConversations((prevConversations) => {
        if (selectedConversation === conversationId) {
          const nextConversation = prevConversations.find(
            (conversation: Conversation) => conversation._id !== conversationId
          );
          setSelectedConversation(nextConversation?._id || null);
        }
        return prevConversations.filter(
          (conversation: Conversation) => conversation._id !== conversationId
        );
      });
    } catch (error) {
      showErrorToast("Error deleting conversation:", error);
    }
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      showErrorToast("Unsupported file type!");
      return;
    }

    setSelectedFile(file);

    if (file.type.startsWith("image/")) {
      setFilePreview(URL.createObjectURL(file));
    } else {
      setFilePreview(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  const selectedConv = Array.isArray(conversations)
    ? conversations.find((c) => c._id === selectedConversation)
    : undefined;

  return (
    <div className="max-w-full mx-auto lg:p-6" style={{ overflow: "hidden" }}>
      {errors && <ErrorDisplay error={errors} />}
      <div className="bg-white lg:rounded-xl shadow-sm border border-gray-100 flex h-[94vh] lg:h-[85vh]">
        <MessageThread
          selectedConversation={selectedConv}
          messages={
            selectedConversation ? messages[selectedConversation] || [] : []
          }
          newMessage={newMessage}
          selectedFile={selectedFile}
          filePreview={filePreview}
          isLoadingMessages={isLoadingMessages || isSelectingConversation}
          isSendingMessage={isSendingMessage}
          anotherUserAllowMessage={anotherUserAllowMessage}
          showProfile={showProfile}
          onMessageChange={setNewMessage}
          onFileSelected={handleFileSelected}
          onSendMessage={handleSendMessage}
          onArchiveConversation={handleArchiveConversation}
          onUnarchiveConversation={handleUnarchiveConversation}
          onBlockConversation={handleBlockConversation}
          onUnblockConversation={handleUnblockConversation}
          onDeleteConversation={handleDeleteConversation}
          onRestoreConversation={handleRestoreConversation}
          onRemoveFile={handleRemoveFile}
          isArchiveMode={false}
          isTrashMode={false}
          isBlockMode={false}
          allowMessage={false}
        />
      </div>
    </div>
  );
};

export default Messages;
