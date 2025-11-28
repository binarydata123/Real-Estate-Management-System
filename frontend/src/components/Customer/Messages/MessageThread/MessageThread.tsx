"use client";
import React, { useRef, useEffect } from "react";
import { MessageThreadProps } from "../types/messageTypes";
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
  anotherUserAllowMessage,
  showProfile,
  onMessageChange,
  onFileSelected,
  onRemoveFile,
  onSendMessage,
  onArchiveConversation,
  onUnarchiveConversation,
  onBlockConversation,
  onUnblockConversation,
  onDeleteConversation,
  onRestoreConversation,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (selectedConversation && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, selectedConversation]);

  // if (!selectedConversation && !isLoadingMessages) {
  //   return (
  //     <div className="flex-1 flex items-center justify-center">
  //       <EmptyState
  //         icon={<MessageSquare className="w-16 h-16 text-gray-300 " />}
  //         title="No conversation selected"
  //         message="Select a conversation from the list to start messaging"
  //       />
  //     </div>
  //   );
  // }

  const isFirstMessageEmpty =
    messages.length === 1 &&
    !messages[0].content?.trim() &&
    (!messages[0].attachments || messages[0].attachments.length === 0);

  return (
    <div className={`flex-1 flex flex-col ${"flex"}`}>
      <MessageHeader
        selectedConversation={selectedConversation}
        showProfile={showProfile}
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
