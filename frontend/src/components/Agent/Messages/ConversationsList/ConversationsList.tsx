/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import SearchHeader from "./SearchHeader";
import ConversationItem from "./ConversationItem";
import ActionButtons from "./ActionButtons";
import { IoArrowBackSharp } from "react-icons/io5";
import { useAuth } from "@/context/AuthContext";
import LoadingSpinner from "../UI/LoadingSpinner";
import EmptyState from "../UI/EmptyState";
import { ConversationListProps } from "../types/messageTypes";
import { MessageSquare } from "lucide-react";

interface ConversationsListComponentProps extends ConversationListProps {
  getUnreadCount: (conversation: any) => number;
  getTruncatedMessage: (
    html: string | null | undefined,
    length?: number
  ) => string;
  filteredConversations: any[];
  customers: any[];
}

const ConversationsList: React.FC<ConversationsListComponentProps> = ({
  selectedConversation,
  setSelectedConversation,
  searchTerm,
  setSearchTerm,
  isLoadingConversations,
  error,
  isArchiveMode,
  setIsArchiveMode,
  isTrashMode,
  setIsTrashMode,
  isBlockMode,
  setIsBlockMode,
  archiveCount,
  deletedCount,
  blockedCount,
  fetchConversations,
  fetchArchivedConversations,
  fetchDeletedConversations,
  fetchBlockedConversations,
  showConversationList,
  setShowConversationList,
  handleViewCandidate,
  getUnreadCount,
  getTruncatedMessage,
  filteredConversations,
}) => {
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    // Check initially
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener("resize", checkScreenSize);

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleBack = () => {
    setIsArchiveMode(false);
    setIsTrashMode(false);
    setIsBlockMode(false);
    fetchConversations();
  };

  const handleArchive = () => {
    fetchArchivedConversations();
    setIsArchiveMode(true);
    setIsTrashMode(false);
    setIsBlockMode(false);
  };

  const handleTrash = () => {
    fetchDeletedConversations();
    setIsTrashMode(true);
    setIsArchiveMode(false);
    setIsBlockMode(false);
  };

  const handleBlock = () => {
    fetchBlockedConversations();
    setIsArchiveMode(false);
    setIsBlockMode(true);
    setIsTrashMode(false);
  };

  // Updated handleSelect to automatically hide conversation list in mobile
  const handleSelect = (conversationId: string) => {
    setSelectedConversation(conversationId);
    // Hide conversation list in mobile view when a conversation is selected
    if (isMobile) {
      setShowConversationList(false);
    }
  };

  return (
    <div
      className={`w-full lg:w-1/3 border-r border-gray-200 flex flex-col ${showConversationList ? "flex" : "hidden lg:flex"
        }`}
    >
      {/* Mobile header with back button - Only shows in mobile */}
      {isMobile && (
        <div className="lg:hidden flex items-center justify-between p-2 border-b border-gray-200">
          <div className="flex items-center">
            {(isArchiveMode || isTrashMode || isBlockMode) && (
              <div>
                <button
                  type="button"
                  className="text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-full text-sm p-1 text-center inline-flex items-center me-2 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
                  onClick={handleBack}
                >
                  <IoArrowBackSharp />
                </button>
              </div>
            )}
            <h3 className="font-semibold text-gray-900">
              {isArchiveMode
                ? "Archived Messages"
                : isTrashMode
                  ? "Deleted Messages"
                  : isBlockMode
                    ? "Blocked Messages"
                    : "Conversations"}
            </h3>

          </div>
          <div className="lg:hidden flex items-center justify-between">
            <ActionButtons
              isArchiveMode={isArchiveMode}
              isTrashMode={isTrashMode}
              isBlockMode={isBlockMode}
              archiveCount={archiveCount}
              deletedCount={deletedCount}
              blockedCount={blockedCount}
              onArchive={handleArchive}
              onTrash={handleTrash}
              onBlock={handleBlock}
            />
          </div>
        </div>
      )}

      {/* SearchHeader - Shows search and desktop ActionButtons */}
      <SearchHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        isArchiveMode={isArchiveMode}
        isTrashMode={isTrashMode}
        isBlockMode={isBlockMode}
        onBack={handleBack}
        archiveCount={archiveCount}
        deletedCount={deletedCount}
        blockedCount={blockedCount}
        onArchive={handleArchive}
        onTrash={handleTrash}
        onBlock={handleBlock}
        isMobile={isMobile} // Pass the actual mobile state
      />

      {isLoadingConversations ? (
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <EmptyState title={error} />
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation._id}
                conversation={conversation}
                isSelected={selectedConversation === conversation._id}
                unreadCount={getUnreadCount(conversation)}
                onSelect={handleSelect}
                onViewCandidate={handleViewCandidate}
                getTruncatedMessage={getTruncatedMessage}
                currentUserId={user?._id}
                isMobile={isMobile}
              />
            ))
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                icon={
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                }
                title="No conversation selected"
                description="Select a conversation from the list to start messaging"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConversationsList;
