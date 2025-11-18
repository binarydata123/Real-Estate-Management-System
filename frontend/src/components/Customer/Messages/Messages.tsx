"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
//import { useSearchParams } from "react-router-dom";
import { useParams } from "next/navigation";
import ConversationsList from "./ConversationsList/ConversationsList";
import MessageThread from "./MessageThread/MessageThread";
import { Conversation, Message } from "./types/messageTypes";
import { useAuth } from "@/context/AuthContext";
import { getConversations, getConversationMessages, archiveConversation, blockConversation, deleteConversation, markConversationAsRead, restoreConversation, sendMessage, startConversation, unArchiveConversation, unblockConversation, uploadFile } from "@/lib/Customer/MessagesAPI";
import { io } from "socket.io-client";

const Messages: React.FC = () => {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [allowMessage, setAllowMessage] = useState(true);
  const [anotherUserAllowMessage, setAnotherUserAllowMessage] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [archiveCount, setArchiveCount] = useState<number>(0);
  const [deletedCount, setDeletedCount] = useState<number>(0);
  const [blockedCount, setBlockedCount] = useState<number>(0);
  const [isArchiveMode, setIsArchiveMode] = useState(false);
  const [isTrashMode, setIsTrashMode] = useState(false);
  const [isBlockMode, setIsBlockMode] = useState(false);
  // const [searchParams] = useSearchParams();
  // const applicantId = searchParams.get("applicant");
  // const applicationId = searchParams.get("applicationId");
  // const isType = searchParams.get("type");
  const hasStartedConversation = useRef(false);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showProfile, setShowProfile] = useState(true);
  const [showConversationList, setShowConversationList] = useState(true);

  const params = useParams();
  const applicantId = params.applicant as string;
  const applicationId = params.applicationId as string;
  const isType = params.type as string;
const socket = useMemo(() => {
        return io("http://localhost:5001", {
            withCredentials: true,
        });
    }, []);
useEffect(() => {
        // Join room
         console.log(selectedConversation,"conversation id")
        if(!selectedConversation)return;
        socket.emit("join_conversation", selectedConversation);

        // Live updates from socket
        socket.on("messages_update", (conversationId:string) => {
            fetchConversationMessages(conversationId);
        });
        socket.on("joined",(id)=>[
  console.log("user joined with room:",id)
])

        // Cleanup listener on unmount
        return () => {
            socket.off("messages_update");
        };
    }, [selectedConversation]);
  // Fetch conversations on component mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Fetch messages when a conversation is selected
  useEffect(() => {
    if (!selectedConversation) return;
      fetchConversationMessages(selectedConversation);
      markAsRead(selectedConversation);
  }, [selectedConversation]);

  useEffect(() => {
    if (applicantId && !hasStartedConversation.current) {
      hasStartedConversation.current = true;
      startNewConversation(applicantId, applicationId || undefined);
    }
  }, [applicantId, applicationId]);

    // Updated handleSelect to automatically hide conversation list in mobile
    const handleConversationSelect = (conversationId: string) => {
      setSelectedConversation(conversationId);
      // Hide conversation list in mobile view when a conversation is selected
      if (window.innerWidth < 1024) { // lg breakpoint
        setShowConversationList(false);
      }
    };
  const startNewConversation = async (applicantId: string, applicationId?: string) => {
    try {
      const attachments = selectedFile ? [selectedFile] : [];
      const bodyData = {
        content: isType ? "Hey! I saw your profile on this platform and wanted to connect." : "",
        attachments,
        applicationId,
      };
      const data = await startConversation(
        applicantId,
        bodyData
      );
      if (data.success) {
        const newConversationId = data.data.data.conversationId;
        setSelectedConversation(newConversationId);
        fetchConversations(newConversationId);
      }
    } catch (error) {
      console.error("Error starting new conversation:", error);
    }
  };

  const fetchConversations = async (priorityConversationId?: string) => {
    setIsLoadingConversations(true);
    setError(null);
    try {
      const { conversations } = await getConversations();
      //setAllowMessage(allowMessages);
      setConversations(Array.isArray(conversations) ? conversations : []);

      if (priorityConversationId) {
        setSelectedConversation(priorityConversationId);
      } else if (conversations.length > 0 && !selectedConversation) {
        setSelectedConversation(conversations[0]._id);
      }
      setIsLoadingConversations(false);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setError("Failed to load conversations. Please try again.");
      setIsLoadingConversations(false);
    }
  };

  const fetchArchivedConversations = async () => {
    setIsLoadingConversations(true);
    setError(null);
    try {
      const { conversations, archiveCount, deletedCount, blockedCount, allowMessages } = 
        await getConversations({ archived: true });
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
    } catch (error) {
      console.error("Error fetching archived conversations:", error);
      setError("Failed to load archived conversations. Please try again.");
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const fetchDeletedConversations = async () => {
    setIsLoadingConversations(true);
    setError(null);
    try {
      const { conversations, archiveCount, deletedCount, blockedCount, allowMessages } = 
        await getConversations({ deleted: true });
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
    } catch (error) {
      console.error("Error fetching deleted conversations:", error);
      setError("Failed to load deleted conversations. Please try again.");
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const fetchBlockedConversations = async () => {
    setIsLoadingConversations(true);
    setError(null);
    try {
      const { conversations, archiveCount, deletedCount, blockedCount, allowMessages } = 
        await getConversations({ blocked: true });
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
    } catch (error) {
      console.error("Error fetching blocked conversations:", error);
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
      setShowProfile(data.showProfile);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoadingMessages(false);
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
      console.error("Error marking conversation as read:", error);
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
      console.error("Error sending message or uploading file:", error);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleArchiveConversation = async (conversationId: string) => {
    try {
      await archiveConversation(conversationId);
      setConversations((prev) => prev.filter((conv) => conv._id !== conversationId));
      setArchiveCount((prev) => prev + 1);

      if (selectedConversation === conversationId) {
        const nextConversation = conversations.find((conv) => conv._id !== conversationId);
        setSelectedConversation(nextConversation?._id || null);
      }
    } catch (error) {
      console.error("Error archiving conversation:", error);
    }
  };

  const handleUnarchiveConversation = async (conversationId: string) => {
    try {
      await unArchiveConversation(conversationId);
      setConversations((prev) => prev.filter((conv) => conv._id !== conversationId));
      setArchiveCount((prev) => Math.max(prev - 1, 0));

      if (selectedConversation === conversationId) {
        const nextConversation = conversations.find((conv) => conv._id !== conversationId);
        setSelectedConversation(nextConversation?._id || null);
      }
    } catch (error) {
      console.error("Error unarchiving conversation:", error);
    }
  };

  const handleRestoreConversation = async (conversationId: string) => {
    try {
      await restoreConversation(conversationId);
      setConversations((prev) => prev.filter((conv) => conv._id !== conversationId));

      if (isTrashMode) {
        setDeletedCount((prev) => Math.max(prev - 1, 0));
      }
      if (isArchiveMode) {
        setArchiveCount((prev) => Math.max(prev - 1, 0));
      }

      if (selectedConversation === conversationId) {
        const nextConversation = conversations.find((conv) => conv._id !== conversationId);
        setSelectedConversation(nextConversation?._id || null);
      }
    } catch (err) {
      console.error("Error restoring conversation: ", err);
    }
  };

  const handleUnblockConversation = async (conversationId: string) => {
    try {
      await unblockConversation(conversationId);
      setConversations((prev) => prev.filter((conv) => conv._id !== conversationId));
      setBlockedCount((prev) => Math.max(prev - 1, 0));

      if (isArchiveMode) {
        setArchiveCount((prev) => Math.max(prev - 1, 0));
      }

      if (selectedConversation === conversationId) {
        const nextConversation = conversations.find((conv) => conv._id !== conversationId);
        setSelectedConversation(nextConversation?._id || null);
      }
    } catch (error) {
      console.error("Error unblocking conversation:", error);
    }
  };

  const handleBlockConversation = async (conversationId: string) => {
    try {
      await blockConversation(conversationId);
      setConversations((prev) => prev.filter((conv) => conv._id !== conversationId));
      setBlockedCount((prev) => prev + 1);

      if (isArchiveMode) {
        setArchiveCount((prev) => Math.max(prev - 1, 0));
      }

      if (selectedConversation === conversationId) {
        const nextConversation = conversations.find((conv) => conv._id !== conversationId);
        setSelectedConversation(nextConversation?._id || null);
      }
    } catch (error) {
      console.error("Error blocking conversation:", error);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await deleteConversation(conversationId);
      setConversations((prev) => prev.filter((conv) => conv._id !== conversationId));
      setDeletedCount((prev) => prev + 1);

      if (isArchiveMode) {
        setArchiveCount((prev) => Math.max(prev - 1, 0));
      }

      if (selectedConversation === conversationId) {
        const nextConversation = conversations.find((conv) => conv._id !== conversationId);
        setSelectedConversation(nextConversation?._id || null);
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
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
      console.error("Unsupported file type!");
      return;
    }

    setSelectedFile(file);

    if (file.type.startsWith("image/")) {
      setFilePreview(URL.createObjectURL(file));
    } else {
      setFilePreview(null);
    }
  };

  const handleViewCompany = (companyId: string) => {
    setSelectedCompany(companyId);
  };

  const handleJobClick = (job:any) => {
    setSelectedJob(job);
    setShowJobModal(true);
  };

  const handleApply = async () => {
    try {
      console.log('action')
    } catch (error) {
      console.error("Error applying for job:", error);
    }
  };

  const handleCompanyClick = (companyId: string) => {
    setSelectedCompany(companyId);
  };

  // if (selectedCompany) {
  //   return (
  //     <>
  //       <CompanyDetailPage
  //         companyId={selectedCompany}
  //         onBack={() => setSelectedCompany(null)}
  //         onJobClick={handleJobClick}
  //       />
  //       <JobDetailModal
  //         job={selectedJob}
  //         isOpen={showJobModal}
  //         onClose={() => setShowJobModal(false)}
  //         onApply={handleApply}
  //         onCompanyView={handleCompanyClick}
  //         onToggleSave={() => {}}
  //       />
  //     </>
  //   );
  // }

  const selectedConv = Array.isArray(conversations)
    ? conversations.find((c) => c._id === selectedConversation)
    : undefined;

    return (
      <div className="max-w-full mx-auto lg:p-6" style={{ overflow: "hidden" }}>
        <div className="bg-white lg:rounded-xl shadow-sm border border-gray-100 flex h-[94vh] lg:h-[85vh]">
          {/* <ConversationsList
            conversations={conversations}
            selectedConversation={selectedConversation}
            searchTerm={searchTerm}
            isLoading={isLoadingConversations}
            error={error}
            isArchiveMode={isArchiveMode}
            isTrashMode={isTrashMode}
            isBlockMode={isBlockMode}
            archiveCount={archiveCount}
            deletedCount={deletedCount}
            blockedCount={blockedCount}
            showConversationList={showConversationList}
            onSearchChange={setSearchTerm}
            onConversationSelect={handleConversationSelect} // Use the updated handler
            onFetchConversations={fetchConversations}
            onFetchArchived={fetchArchivedConversations}
            onFetchDeleted={fetchDeletedConversations}
            onFetchBlocked={fetchBlockedConversations}
            onSetArchiveMode={setIsArchiveMode}
            onSetTrashMode={setIsTrashMode}
            onSetBlockMode={setIsBlockMode}
            onSetShowConversationList={setShowConversationList}
          /> */}
  
          <MessageThread
            selectedConversation={selectedConv}
            messages={selectedConversation ? messages[selectedConversation] || [] : []}
            newMessage={newMessage}
            selectedFile={selectedFile}
            filePreview={filePreview}
            isLoadingMessages={isLoadingMessages}
            isSendingMessage={isSendingMessage}
            isArchiveMode={isArchiveMode}
            isTrashMode={isTrashMode}
            isBlockMode={isBlockMode}
            allowMessage={allowMessage}
            anotherUserAllowMessage={anotherUserAllowMessage}
            showProfile={showProfile}
            showConversationList={showConversationList}
            onMessageChange={setNewMessage}
            onFileSelected={handleFileSelected}
            onSendMessage={handleSendMessage}
            onSetShowConversationList={setShowConversationList}
            onViewCompany={handleViewCompany}
            onArchiveConversation={handleArchiveConversation}
            onUnarchiveConversation={handleUnarchiveConversation}
            onBlockConversation={handleBlockConversation}
            onUnblockConversation={handleUnblockConversation}
            onDeleteConversation={handleDeleteConversation}
            onRestoreConversation={handleRestoreConversation}
          />
        </div>
      </div>
    );
  };
  
  export default Messages;