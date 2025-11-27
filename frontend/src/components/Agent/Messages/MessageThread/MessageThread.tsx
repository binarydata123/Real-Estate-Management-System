import React from "react";
import MessageHeader from "./MessageHeader";
import MessagesList from "./MessagesList";
import MessageInput from "./MessageInput";
//import { Link } from 'react-router-dom';
import { Conversation, Message } from "../types/messageTypes";
interface MessageThreadProps {
  conversation?: Conversation | null;
  messages: Message[];
  newMessage: string;
  setNewMessage: (message: string) => void;
  selectedFile: File | null;
  filePreview: string | null;
  isSendingMessage: boolean;
  isArchiveMode: boolean;
  isTrashMode: boolean;
  isBlockMode: boolean;
  allowMessage: boolean;
  anotherUserAllowMessage: boolean;
  showConversationList: boolean;
  setShowConversationList: (show: boolean) => void;
  onViewCandidate: (candidateId: string, applicationId?: string) => void;
  onViewJob: (jobId: string) => void;
  onArchive: (conversationId: string) => void;
  onUnarchive: (conversationId: string) => void;
  onBlock: (conversationId: string) => void;
  onUnblock: (conversationId: string) => void;
  onDelete: (conversationId: string) => void;
  onRestore: (conversationId: string) => void;
  onFileSelected: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
  onSendMessage: () => void;
  currentUserId?: string;
  copyToast: string | null;
  onCopyToClipboard: (text: string) => void;
  firstUnreadIndex: number;
  isLoadingMessages: boolean;
  userRole?: string;
}

const MessageThread: React.FC<MessageThreadProps> = ({
  conversation,
  messages,
  newMessage,
  setNewMessage,
  selectedFile,
  filePreview,
  isSendingMessage,
  isArchiveMode,
  isTrashMode,
  isBlockMode,
  anotherUserAllowMessage,
  showConversationList,
  setShowConversationList,
  onViewCandidate,
  onViewJob,
  onArchive,
  onUnarchive,
  onBlock,
  onUnblock,
  onDelete,
  onRestore,
  onFileSelected,
  onRemoveFile,
  onSendMessage,
  currentUserId,
  copyToast,
  onCopyToClipboard,
  firstUnreadIndex,
  isLoadingMessages,
}) => {
  // Safe null checks for conversation properties - convert to boolean with default false
  const conversationBlockedByUser = Boolean(
    conversation?.blockedBy?.includes(currentUserId as string)
  );
  const conversationBlockedByOther = Boolean(
    conversation?.blockedBy?.includes(
      conversation?.otherParticipant?._id as string
    )
  );

  return (
    <div
      className={`flex-1 flex flex-col ${
        !showConversationList ? "flex" : "hidden lg:flex"
      }`}
    >
      <MessageHeader
        conversation={conversation}
        showConversationList={showConversationList}
        setShowConversationList={setShowConversationList}
        onViewCandidate={onViewCandidate}
        onViewJob={onViewJob}
        onArchive={onArchive}
        onUnarchive={onUnarchive}
        onBlock={onBlock}
        onUnblock={onUnblock}
        onDelete={onDelete}
        onRestore={onRestore}
        currentUserId={currentUserId}
        copyToast={copyToast}
        onCopyToClipboard={onCopyToClipboard}
      />

      <MessagesList
        messages={messages}
        isLoadingMessages={isLoadingMessages}
        currentUserId={currentUserId}
        firstUnreadIndex={firstUnreadIndex}
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
        setNewMessage={setNewMessage}
        selectedFile={selectedFile}
        filePreview={filePreview}
        isSendingMessage={isSendingMessage}
        isArchiveMode={isArchiveMode}
        isTrashMode={isTrashMode}
        isBlockMode={isBlockMode}
        anotherUserAllowMessage={anotherUserAllowMessage}
        conversationBlockedByUser={conversationBlockedByUser}
        conversationBlockedByOther={conversationBlockedByOther}
        onFileSelected={onFileSelected}
        onRemoveFile={onRemoveFile}
        onSendMessage={onSendMessage}
      />
    </div>
  );
};

export default MessageThread;
