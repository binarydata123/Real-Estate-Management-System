"use client";
import React from 'react';
import { Conversation } from '../types/messageTypes';
import { formatDate } from '../../../../utils/dateFunction/dateFormate';
import StatusBadge from '../UI/StatusBadge';
import Image from 'next/image';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  unreadCount: number;
  onSelect: (conversationId: string) => void;
  onViewCandidate: (candidateId: string, applicationId?: string) => void;
  getTruncatedMessage: (html: string | null | undefined, length?: number) => string;
  currentUserId?: string;
  isMobile?: boolean;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isSelected,
  unreadCount,
  onSelect,
  getTruncatedMessage,
  isMobile = false
}) => {
  const isDeleted = !conversation.otherParticipant;

  const handleClick = () => {
    if (!isDeleted) {
      onSelect(conversation._id);
      // Automatically hide conversation list in mobile view when a conversation is selected
      if (isMobile) {
        // This will be handled by the parent component through the onSelect callback
      }
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`p-3 md:p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
        isSelected
          ? "bg-blue-50 border-r-2 border-blue-500"
          : ""
      } ${isDeleted ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
          {conversation.otherParticipant?.avatar &&
          /^https?:\/\//.test(conversation.otherParticipant.avatar) ? (
            <Image
              src={conversation.otherParticipant.avatar}
              alt={conversation.otherParticipant?.name || "User"}
              className="w-full h-full object-cover"
              width={280}
              height={280}
            />
          ) : (
            <span className="text-xl">
              {conversation.otherParticipant?.name?.charAt(0) || "👤"}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="font-medium text-gray-900 truncate">
              {conversation.otherParticipant?.name || "Deleted User"}{" "}
              <span
                className="capitalize"
                style={{ fontSize: "13px" }}
              >
                (
                {conversation.otherParticipant?.position ||
                  conversation.otherParticipant?.role ||
                  "N/A"}
                )
              </span>
            </p>
            <div className="flex items-center space-x-1">
              {unreadCount > 0 && (
                <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
              <span className="text-xs text-gray-500">
                {formatDate(conversation.lastMessageAt)}
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-600 truncate">
            {conversation.otherParticipant?.application?.jobTitle
              ? `Applied for: ${conversation.otherParticipant.application.jobTitle}`
              : "Direct conversation"}
          </p>

          <p className="text-sm text-gray-700 truncate mt-1 break-words">
            {getTruncatedMessage(conversation.lastMessage, 50)}
          </p>

          {conversation.otherParticipant?.status && (
            <div className="mt-2">
              <StatusBadge status={conversation.otherParticipant.status} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;