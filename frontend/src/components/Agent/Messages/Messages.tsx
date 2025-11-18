/* eslint-disable no-shadow */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
// Components
import ConversationsList from "./ConversationsList/ConversationsList";
import MessageThread from "./MessageThread/MessageThread";
import ErrorDisplay from "./UI/ErrorDisplay";

// Types
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
  startConversation,
  unArchiveConversation,
  unblockConversation,
  uploadFile,
  getCustomers,
} from "@/lib/Agent/MessagesAPI";

import { io } from "socket.io-client";
import { showErrorToast } from "@/utils/toastHandler";

// View Components

const CompanyMessages: React.FC = () => {
  const { user } = useAuth();
  //const [searchParams] = useSearchParams();
  const socket = useMemo(() => {
    return io("http://localhost:5001", {
      withCredentials: true,
    });
  }, []);
  // State
  const [allowMessage, setAllowMessage] = useState(true);
  const [anotherUserAllowMessage, setAnotherUserAllowMessage] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [error, setError] = useState<any | null>(null);
  const [copyToast, setCopyToast] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isArchiveMode, setIsArchiveMode] = useState(false);
  const [isTrashMode, setIsTrashMode] = useState(false);
  const [isBlockMode, setIsBlockMode] = useState(false);
  const [archiveCount, setArchiveCount] = useState<number>(0);
  const [deletedCount, setDeletedCount] = useState<number>(0);
  const [blockedCount, setBlockedCount] = useState<number>(0);
  const [showConversationList, setShowConversationList] = useState(true);

  const [customers, setCustomers] = useState<CustomerFormData[]>([]);

  // Message View States

  const hasStartedConversation = useRef(false);
  const editableRef = useRef<HTMLDivElement>(null);

  // URL Parameters
  // const applicantId = searchParams.get("applicant");
  // const applicationId = searchParams.get("applicationId");
  // const conversationId = searchParams.get("conversationId");

  const params = useParams();
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId");
  //const applicationId = params.applicationId as string;
  const conversationId = params.conversationId as string;

  useEffect(() => {
    // Join room
    if (!selectedConversation) return;
    socket.emit("join_conversation", selectedConversation);

    // Live updates from socket
    // eslint-disable-next-line no-shadow
    socket.on("messages_update", (conversationId: string) => {
      fetchConversationMessages(conversationId);
    });
    // Cleanup listener on unmount
    return () => {
      socket.off("messages_update");
    };
  }, [selectedConversation]);

  // Initialize selected conversation
  useEffect(() => {
    setSelectedConversation(conversationId ?? null);
  }, [conversationId]);

  // Fetch conversations on component mount
  useEffect(() => {
    if (!customerId) {
      fetchConversations();
    }
    getAllCustomers();
  }, [customerId]);

  // Reset editable content when new message is empty
  useEffect(() => {
    if (editableRef.current && newMessage === "") {
      editableRef.current.innerHTML = "";
    }
  }, [newMessage]);

  // Fetch messages when a conversation is selected
  useEffect(() => {
    if (!selectedConversation) return;
    fetchConversationMessages(selectedConversation);
    markAsRead(selectedConversation);
  }, [selectedConversation]);

  // Start new conversation if applicantId is provided
  useEffect(() => {
    if (customerId && !hasStartedConversation.current) {
      hasStartedConversation.current = true;
      startNewConversation(customerId);
      getAllCustomers();
    }
  }, [customerId]);

  const getAllCustomers = async () => {
    setIsLoadingConversations(true);
    setError(null);
    try {
      const data = await getCustomers();
      if (Array.isArray(data)) {
        setCustomers(data);
      } else if (Array.isArray(data?.data)) {
        setCustomers(data.data);
      } else {
        setCustomers([]);
      }
    } catch (error: any) {
      showErrorToast("Error fetching customers:", error);
      setError("Failed to load customers. Please try again.");
    } finally {
      setIsLoadingConversations(false);
    }
  };

  // API Functions
  const fetchConversations = async (priorityConversationId?: string) => {
    setIsLoadingConversations(true);
    setError(null);
    try {
      const {
        // eslint-disable-next-line no-shadow
        conversations,
        archiveCount,
        deletedCount,
        blockedCount,
        allowMessages,
      } = await getConversations();
      setAllowMessage(allowMessages);
      setConversations(Array.isArray(conversations) ? conversations : []);
      setArchiveCount(archiveCount);
      setDeletedCount(deletedCount);
      setBlockedCount(blockedCount);

      if (priorityConversationId) {
        setSelectedConversation(priorityConversationId);
      } else if (conversations.length > 0 && !selectedConversation) {
        setSelectedConversation(conversations[0]._id);
      }
    } catch (error: any) {
      showErrorToast("Error fetching conversations:", error);
      setError("Failed to load conversations. Please try again.");
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const fetchArchivedConversations = async () => {
    setIsLoadingConversations(true);
    setError(null);
    try {
      const {
        conversations,
        archiveCount,
        deletedCount,
        blockedCount,
        allowMessages,
      } = await getConversations({ archived: true });
      setAllowMessage(allowMessages);
      setConversations(Array.isArray(conversations) ? conversations : []);
      setArchiveCount(archiveCount);
      setDeletedCount(deletedCount);
      setBlockedCount(blockedCount);

      if (conversations.length > 0) {
        setSelectedConversation(conversations[0]._id);
      } else {
        setSelectedConversation(null);
      }
    } catch (error: any) {
      showErrorToast("Error fetching archived conversations:", error);
      setError("Failed to load archived conversations. Please try again.");
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const fetchDeletedConversations = async () => {
    setIsLoadingConversations(true);
    setError(null);
    try {
      const {
        conversations,
        archiveCount,
        deletedCount,
        blockedCount,
        allowMessages,
      } = await getConversations({ deleted: true });
      setAllowMessage(allowMessages);
      setConversations(Array.isArray(conversations) ? conversations : []);
      setArchiveCount(archiveCount);
      setDeletedCount(deletedCount);
      setBlockedCount(blockedCount);

      if (conversations.length > 0) {
        setSelectedConversation(conversations[0]._id);
      } else {
        setSelectedConversation(null);
      }
    } catch (error: any) {
      showErrorToast("Error fetching deleted conversations:", error);
      setError("Failed to load deleted conversations. Please try again.");
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const fetchBlockedConversations = async () => {
    setIsLoadingConversations(true);
    setError(null);
    try {
      const {
        conversations,
        archiveCount,
        deletedCount,
        blockedCount,
        allowMessages,
      } = await getConversations({ blocked: true });
      setAllowMessage(allowMessages);
      setConversations(Array.isArray(conversations) ? conversations : []);
      setArchiveCount(archiveCount);
      setDeletedCount(deletedCount);
      setBlockedCount(blockedCount);

      if (conversations.length > 0) {
        setSelectedConversation(conversations[0]._id);
      } else {
        setSelectedConversation(null);
      }
    } catch (error: any) {
      showErrorToast("Error fetching blocked conversations:", error);
      setError("Failed to load blocked conversations. Please try again.");
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const fetchConversationMessages = async (conversationId: string) => {
    setIsLoadingMessages(true);
    try {
      const data = await getConversationMessages(conversationId);
      setMessages((prev) => ({
        ...prev,
        [conversationId]: data.messages,
      }));
      setAnotherUserAllowMessage(data.allowMessages);
    } catch (error) {
      showErrorToast("Error fetching messages:", error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const startNewConversation = async (customerId: string) => {
    try {
      const messageText =
        user?.role === "customer"
          ? ""
          : "Hello! We are reaching out regarding your information. Please feel free to reply here if you have any questions or would like to discuss further.";

      const data = await startConversation(customerId, {
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
          setError(<>{data.error} </>);
        } else {
          setError("Failed to start conversation.");
        }
      }
    } catch (error: any) {
      showErrorToast("Error starting new conversation:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        "An unexpected error occurred.";
      setError(errorMessage);
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

      // THIS IS CRUCIAL - Clear the message state
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
      setConversations((prev) =>
        prev.filter((conv) => conv._id !== conversationId)
      );
      setArchiveCount((prev) => prev + 1);

      if (selectedConversation === conversationId) {
        const nextConversation = conversations.find(
          (conv) => conv._id !== conversationId
        );
        setSelectedConversation(nextConversation?._id || null);
      }
    } catch (error) {
      showErrorToast("Error archiving conversation:", error);
    }
  };

  const handleUnarchiveConversation = async (conversationId: string) => {
    try {
      await unArchiveConversation(conversationId);
      setConversations((prev) =>
        prev.filter((conv) => conv._id !== conversationId)
      );
      setArchiveCount((prev) => Math.max(prev - 1, 0));

      if (selectedConversation === conversationId) {
        const nextConversation = conversations.find(
          (conv) => conv._id !== conversationId
        );
        setSelectedConversation(nextConversation?._id || null);
      }
    } catch (error) {
      showErrorToast("Error unarchiving conversation:", error);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await deleteConversation(conversationId);
      setConversations((prev) =>
        prev.filter((conv) => conv._id !== conversationId)
      );
      setDeletedCount((prev) => prev + 1);

      if (isArchiveMode) {
        setArchiveCount((prev) => Math.max(prev - 1, 0));
      }

      if (selectedConversation === conversationId) {
        const nextConversation = conversations.find(
          (conv) => conv._id !== conversationId
        );
        setSelectedConversation(nextConversation?._id || null);
      }
    } catch (error) {
      showErrorToast("Error deleting conversation:", error);
    }
  };

  const handleRestoreConversation = async (conversationId: string) => {
    try {
      await restoreConversation(conversationId);
      setConversations((prev) =>
        prev.filter((conv) => conv._id !== conversationId)
      );

      if (isTrashMode) {
        setDeletedCount((prev) => Math.max(prev - 1, 0));
      }

      if (isArchiveMode) {
        setArchiveCount((prev) => Math.max(prev - 1, 0));
      }

      if (selectedConversation === conversationId) {
        const nextConversation = conversations.find(
          (conv) => conv._id !== conversationId
        );
        setSelectedConversation(nextConversation?._id || null);
      }
    } catch (err) {
      showErrorToast("Error restoring conversation: ", err);
    }
  };

  const handleUnblockConversation = async (conversationId: string) => {
    try {
      await unblockConversation(conversationId);
      setConversations((prev) =>
        prev.filter((conv) => conv._id !== conversationId)
      );
      setBlockedCount((prev) => Math.max(prev - 1, 0));

      if (isArchiveMode) {
        setArchiveCount((prev) => Math.max(prev - 1, 0));
      }

      if (selectedConversation === conversationId) {
        const nextConversation = conversations.find(
          (conv) => conv._id !== conversationId
        );
        setSelectedConversation(nextConversation?._id || null);
      }
    } catch (error) {
      showErrorToast("Error unblocking conversation:", error);
    }
  };

  const handleBlockConversation = async (conversationId: string) => {
    try {
      await blockConversation(conversationId);
      setConversations((prev) =>
        prev.filter((conv) => conv._id !== conversationId)
      );
      setBlockedCount((prev) => prev + 1);

      if (isArchiveMode) {
        setArchiveCount((prev) => Math.max(prev - 1, 0));
      }

      if (selectedConversation === conversationId) {
        const nextConversation = conversations.find(
          (conv) => conv._id !== conversationId
        );
        setSelectedConversation(nextConversation?._id || null);
      }
    } catch (error) {
      showErrorToast("Error blocking conversation:", error);
    }
  };

  // Utility Functions
  const getUnreadCount = (conversation: Conversation) => {
    return conversation.unreadCount?.[user?._id as string] || 0;
  };

  const getTruncatedMessage = (
    html: string | null | undefined,
    length = 50
  ): string => {
    try {
      if (!html || typeof html !== "string") return "";

      if (typeof document === "undefined") {
        const plain = html.replace(/<[^>]*>/g, "");
        return plain.length > length
          ? `${plain.substring(0, length)  }...`
          : plain;
      }

      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;
      const plainText = tempDiv.textContent || tempDiv.innerText || "";
      return plainText.length > length
        ? `${plainText.substring(0, length)  }...`
        : plainText;
    } catch (error) {
      showErrorToast("Error processing HTML for truncation:", error);
      return "";
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopyToast(text);
        setTimeout(() => setCopyToast(null), 2000);
      })
      .catch((err) => {
        showErrorToast("Failed to copy:", err);
      });
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
      toast.error("Unsupported file type!");
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

  // const handleViewCandidate = (customerId: string) => {
  //   setSelectedCustomer(customerId);
  // };

  // const handleViewJob = (jobId: string) => {
  //   setSelectedJobId(jobId);
  //   setShowJobDetail(true);
  // };

  // Derived Values
  const filteredConversations = Array.isArray(conversations)
    ? conversations.filter((conv) => {
        const nameMatch = conv.otherParticipant?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
        const positionMatch = conv.otherParticipant?.position
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
        const lastMessageMatch = conv.lastMessage
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
        return nameMatch || positionMatch || lastMessageMatch;
      })
    : [];

  const selectedConv = Array.isArray(conversations)
    ? conversations.find((c) => c._id === selectedConversation)
    : undefined;

  const conversationMessages = selectedConversation
    ? messages[selectedConversation] || []
    : [];

  const firstUnreadIndex = conversationMessages.findIndex(
    (m) => !m.isRead && m.receiverId === user?._id
  );
  return (
    <div className="max-w-full mx-auto lg:p-6" style={{ overflow: "hidden" }}>
      {error && <ErrorDisplay error={error} />}
      {/* <div className="flex flex-col lg:flex-row gap-4">
          customers: {customers.length}
        </div> */}
      <div className="bg-white lg:rounded-xl shadow-sm border border-gray-100 flex h-[94vh] lg:h-[85vh]">
        <ConversationsList
          conversations={conversations}
          selectedConversation={selectedConversation}
          setSelectedConversation={setSelectedConversation}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          isLoadingConversations={isLoadingConversations}
          error={error}
          isArchiveMode={isArchiveMode}
          setIsArchiveMode={setIsArchiveMode}
          isTrashMode={isTrashMode}
          setIsTrashMode={setIsTrashMode}
          isBlockMode={isBlockMode}
          setIsBlockMode={setIsBlockMode}
          archiveCount={archiveCount}
          deletedCount={deletedCount}
          blockedCount={blockedCount}
          fetchConversations={fetchConversations}
          fetchArchivedConversations={fetchArchivedConversations}
          fetchDeletedConversations={fetchDeletedConversations}
          fetchBlockedConversations={fetchBlockedConversations}
          showConversationList={showConversationList}
          setShowConversationList={setShowConversationList}
          handleViewCandidate={()=>{}}
          getUnreadCount={getUnreadCount}
          getTruncatedMessage={getTruncatedMessage}
          filteredConversations={filteredConversations}
          customers={customers}
        />

        <MessageThread
          conversation={selectedConv || null} // Changed from selectedConv!
          messages={conversationMessages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          selectedFile={selectedFile}
          filePreview={filePreview}
          isSendingMessage={isSendingMessage}
          isArchiveMode={isArchiveMode}
          isTrashMode={isTrashMode}
          isBlockMode={isBlockMode}
          allowMessage={allowMessage}
          anotherUserAllowMessage={anotherUserAllowMessage}
          showConversationList={showConversationList}
          setShowConversationList={setShowConversationList}
          onViewCandidate={()=>{}}
          onViewJob={()=>{}}
          onArchive={handleArchiveConversation}
          onUnarchive={handleUnarchiveConversation}
          onBlock={handleBlockConversation}
          onUnblock={handleUnblockConversation}
          onDelete={handleDeleteConversation}
          onRestore={handleRestoreConversation}
          onFileSelected={handleFileSelected}
          onRemoveFile={handleRemoveFile}
          onSendMessage={handleSendMessage}
          currentUserId={user?._id}
          copyToast={copyToast}
          onCopyToClipboard={handleCopyToClipboard}
          firstUnreadIndex={firstUnreadIndex}
          isLoadingMessages={isLoadingMessages}
          userRole={user?.role}
        />
      </div>
    </div>
  );
};

export default CompanyMessages;
