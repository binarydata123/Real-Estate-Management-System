"use client";
import React, { useRef, useEffect } from "react";
import { MessageThreadProps } from "../types/messageTypes";
import { Ban, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import EmptyState from "../UI/EmptyState";
import MessageHeader from "./MessageHeader";
import MessagesList from "./MessagesList";
import MessageInput from "./MessageInput";

const MessageThread: React.FC<MessageThreadProps> = ({
  selectedConversation,
  messages,
  newMessage,
  selectedFile,
  filePreview,
  isLoadingMessages,
  isSendingMessage,
  isArchiveMode,
  isTrashMode,
  isBlockMode,
  allowMessage,
  anotherUserAllowMessage,
  showProfile,
  showConversationList,
  onMessageChange,
  onFileSelected,
  onRemoveFile,
  onSendMessage,
  onSetShowConversationList,
  onViewCompany,
  onArchiveConversation,
  onUnarchiveConversation,
  onBlockConversation,
  onUnblockConversation,
  onDeleteConversation,
  onRestoreConversation,
}) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (selectedConversation && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, selectedConversation]);

  if (!selectedConversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          icon={<MessageSquare className="w-16 h-16 text-gray-300 " />}
          title="No conversation selected"
          message="Select a conversation from the list to start messaging"
        />
      </div>
    );
  }

  const isMentorRole = selectedConversation?.otherParticipant?.role === "mentor";
  const isFirstMessageEmpty =
    !isMentorRole &&
    messages.length === 1 &&
    !messages[0].content?.trim() &&
    (!messages[0].attachments || messages[0].attachments.length === 0);

  return (
    <div className={`flex-1 flex flex-col ${!showConversationList ? "flex" : "hidden lg:flex"}`}>
      {!allowMessage && (
        <div className="flex items-center space-x-3 p-4 bg-red-100 border border-red-300 rounded-lg shadow-md">
          <div className="flex-shrink-0">
            <Ban className="w-7 h-7 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="text-red-800 font-bold text-base">Messaging is Turned Off</p>
            <p className="text-red-700 text-sm mt-1 leading-relaxed">
              You&apos;ve disabled incoming messages, so recruiters or directors can&apos;t reach out to you.
              <Link
                href={`/${user?.role}/settings`}
                className="font-medium underline hover:text-red-900 ml-1"
              >
                Update privacy settings
              </Link>{" "}
              to enable messaging again.
            </p>
          </div>
        </div>
      )}

      <MessageHeader
        selectedConversation={selectedConversation}
        showConversationList={showConversationList}
        showProfile={showProfile}
        onSetShowConversationList={onSetShowConversationList}
        onViewCompany={onViewCompany}
        onArchiveConversation={onArchiveConversation}
        onUnarchiveConversation={onUnarchiveConversation}
        onBlockConversation={onBlockConversation}
        onUnblockConversation={onUnblockConversation}
        onDeleteConversation={onDeleteConversation}
        onRestoreConversation={onRestoreConversation}
      />

      <MessagesList
        messages={messages}
        isLoading={isLoadingMessages}
        messagesEndRef={messagesEndRef}
      />

      {anotherUserAllowMessage === false && (
        <div className="flex items-center justify-center space-x-3 px-3 py-2 ">
          <p className="text-red-600 text-sm">
            This user has disabled messages. You cannot send new messages.
          </p>
        </div>
      )}

      <MessageInput
        newMessage={newMessage}
        selectedFile={selectedFile}
        filePreview={filePreview}
        isSendingMessage={isSendingMessage}
        isArchiveMode={isArchiveMode}
        isTrashMode={isTrashMode}
        isBlockMode={isBlockMode}
        selectedConversation={selectedConversation}
        anotherUserAllowMessage={anotherUserAllowMessage}
        isFirstMessageEmpty={isFirstMessageEmpty}
        onMessageChange={onMessageChange}
        onFileSelected={onFileSelected}
        onRemoveFile={onRemoveFile}
        onSendMessage={onSendMessage}
      />
    </div>
  );
};

export default MessageThread;
