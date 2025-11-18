import React from "react";
import { MessageSquare } from "lucide-react";
import SearchHeader from "./SearchHeader";
import LoadingSpinner from "../UI/LoadingSpinner";
import ErrorDisplay from "../UI/ErrorDisplay";
import EmptyState from "../UI/EmptyState";
import ConversationItem from "./ConversationItem";
import { ConversationsListProps } from "../types/messageTypes";

const ConversationsList: React.FC<ConversationsListProps> = ({
  conversations,
  selectedConversation,
  searchTerm,
  isLoading,
  error,
  isArchiveMode,
  isTrashMode,
  isBlockMode,
  archiveCount,
  deletedCount,
  blockedCount,
  showConversationList,
  onSearchChange,
  onConversationSelect,
  onFetchConversations,
  onFetchArchived,
  onFetchDeleted,
  onFetchBlocked,
  onSetArchiveMode,
  onSetTrashMode,
  onSetBlockMode,
  onSetShowConversationList,
}) => {
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

  return (
    <div
      className={`w-full lg:w-1/3 border-r border-gray-200 flex flex-col ${
        showConversationList ? "flex" : "hidden lg:flex"
      }`}
    >
      <SearchHeader
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        isArchiveMode={isArchiveMode}
        isTrashMode={isTrashMode}
        isBlockMode={isBlockMode}
        archiveCount={archiveCount}
        deletedCount={deletedCount}
        blockedCount={blockedCount}
        onFetchConversations={onFetchConversations}
        onFetchArchived={onFetchArchived}
        onFetchDeleted={onFetchDeleted}
        onFetchBlocked={onFetchBlocked}
        onSetArchiveMode={onSetArchiveMode}
        onSetTrashMode={onSetTrashMode}
        onSetBlockMode={onSetBlockMode}
        onSetShowConversationList={onSetShowConversationList}
      />

      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorDisplay message={error} />
      ) : filteredConversations.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="w-8 h-8 text-gray-300" />}
          message="No conversations found"
        />
      ) : (
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <ConversationItem
              key={conversation._id}
              conversation={conversation}
              isSelected={selectedConversation === conversation._id}
              onSelect={onConversationSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ConversationsList;