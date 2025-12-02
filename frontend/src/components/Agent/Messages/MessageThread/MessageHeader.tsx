"use client";
import React, { useState } from 'react';
import { MoreVertical, Phone, Mail } from 'lucide-react';
import { IoArrowBackSharp } from 'react-icons/io5';
import { Conversation } from '../types/messageTypes';
import StatusBadge from '../UI/StatusBadge';
import Image from 'next/image';

interface MessageHeaderProps {
  conversation?: Conversation | null;
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
  currentUserId?: string;
  copyToast: string | null;
  onCopyToClipboard: (text: string) => void;
}

const MessageHeader: React.FC<MessageHeaderProps> = ({
  conversation,
  setShowConversationList,
  onViewCandidate,
  onArchive,
  onUnarchive,
  onBlock,
  onUnblock,
  onDelete,
  onRestore,
  currentUserId,
  copyToast,
  onCopyToClipboard
}) => {
  const [showMenu, setShowMenu] = useState<string | null>(null);

  // Safe null checks
  if (!conversation) {
    return null;
  }

  const isArchived = conversation.archivedBy?.includes(currentUserId as string);
  const isDeleted = conversation.deletedBy?.includes(currentUserId as string);
  const isBlocked = conversation.blockedBy?.includes(currentUserId as string);

  return (
    <>
      {/* Header */}
      <div className="p-2 md:p-4 border-b border-gray-200 bg-gray-50 flex items-center">
        <button
          className="lg:hidden p-1 mr-2 text-gray-600"
          onClick={() => setShowConversationList(true)}
        >
          <IoArrowBackSharp className="w-5 h-5" />
        </button>
        <div className="flex items-center justify-between w-full">
          <div
            className="flex-1 flex items-center space-x-3 min-w-0 overflow-hidden"
            style={{ cursor: "pointer" }}
          >
            <div
              className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0"
              onClick={() => {
                if (conversation.otherParticipant?.role !== "admin") {
                  onViewCandidate(
                    conversation.otherParticipant?._id as string,
                  );
                }
              }}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
                {/^https?:\/\//.test(conversation.otherParticipant?.avatar || "") ? (
                  <Image
                    src={conversation.otherParticipant?.avatar as string}
                    alt={conversation.otherParticipant?.name as string}
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
            </div>

            <div className="min-w-0 overflow-hidden">
              <div className="flex flex-col">
                <h3
                  className={`font-semibold text-gray-900 truncate capitalize hover:text-gray-800 cursor-pointer ${conversation.otherParticipant?.role !== "admin" &&
                    "hover:text-gray-800 relative group"
                    }`}
                  onClick={() => {
                    if (conversation.otherParticipant?.role !== "admin") {
                      onViewCandidate(
                        conversation.otherParticipant?._id as string,
                        conversation.otherParticipant?.application?._id as string
                      );
                    }
                  }}
                >
                  {conversation.otherParticipant?.name || "Deleted User"}
                </h3>
                <a
                  href={`tel:${conversation.otherParticipant?.phone}`}
                  className="underline text-primary"
                >
                  {conversation.otherParticipant?.phone}
                </a>
                <p>
                </p>
              </div>
            </div>
          </div>

          {/* Status and menu button - positioned at the end */}
          <div className="flex items-center space-x-2 md:ml-2">
            <div className="hidden md:block relative hover:text-gray-800 group">
              {conversation.otherParticipant?.status && (
                <StatusBadge status={conversation.otherParticipant.status} />
              )}
              <div className="absolute -top-9 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center justify-center whitespace-nowrap bg-gray-900 text-white text-xs rounded py-1 px-2 z-10 shadow">
                Click on view profile to <br /> manage candidate status
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
              </div>
            </div>
            <div className="relative">
              <button
                onClick={() =>
                  setShowMenu(
                    showMenu === conversation._id
                      ? null
                      : conversation._id
                  )
                }
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu === conversation._id && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(null)}
                  />

                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 py-1 border border-gray-200">
                    {isDeleted ? (
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-gray-100"
                        onClick={() => onRestore(conversation._id)}
                      >
                        Restore Conversation
                      </button>
                    ) : isBlocked ? (
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-gray-100"
                        onClick={() => onUnblock(conversation._id)}
                      >
                        Unblock Conversation
                      </button>
                    ) : (
                      <>
                        <button
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() =>
                            isArchived
                              ? onUnarchive(conversation._id)
                              : onArchive(conversation._id)
                          }
                        >
                          {isArchived
                            ? "Unarchive Conversation"
                            : "Archive Conversation"}
                        </button>
                        <button
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => onBlock(conversation._id)}
                        >
                          Block Conversation
                        </button>
                        <button
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                          onClick={() => onDelete(conversation._id)}
                        >
                          Delete Conversation
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Candidate Info */}
      <div className="hidden md:block p-3 border-b border-gray-200 bg-blue-50">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            {conversation.otherParticipant?.email && (
              <div className="relative flex items-center space-x-1 text-gray-600 cursor-pointer hover:text-gray-800 group">
                <Mail className="w-3 h-3" />
                <a
                  href={`mailto:${conversation.otherParticipant?.email}`}
                  className="hover:underline break-all"
                >
                  {conversation.otherParticipant?.email}
                </a>
                <div className="absolute -top-9 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center justify-center whitespace-nowrap bg-gray-900 text-white text-xs rounded py-1 px-2 z-10 shadow">
                  Click to email
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              </div>
            )}
            {conversation.otherParticipant?.phone && (
              <div
                className="relative flex items-center space-x-1 text-gray-600 cursor-pointer hover:text-gray-800 group"
                onClick={() =>
                  onCopyToClipboard(conversation.otherParticipant?.phone as string)
                }
              >
                <Phone className="w-3 h-3" />
                <span>{conversation.otherParticipant?.phone}</span>

                {/* Hover tooltip */}
                {copyToast !== conversation.otherParticipant?.phone && (
                  <div className="absolute -top-9 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center justify-center whitespace-nowrap bg-gray-900 text-white text-xs rounded py-1 px-2 z-10 shadow">
                    Copy to clipboard
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                )}

                {/* Copied tooltip */}
                {copyToast === conversation.otherParticipant?.phone && (
                  <div className="absolute -top-9 left-1/2 -translate-x-1/2 flex items-center justify-center whitespace-nowrap bg-green-700 text-white text-xs rounded py-1 px-2 z-10 shadow">
                    Copied!
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-green-700 rotate-45"></div>
                  </div>
                )}
              </div>
            )}
          </div>
          <button
            className="text-primary text-xs font-medium"
            onClick={() => {
              if (conversation.otherParticipant?.role !== "admin") {
                onViewCandidate(
                  conversation.otherParticipant?._id as string,
                  conversation.otherParticipant?.application?._id as string
                );
              }
            }}
          >
            View Profile
          </button>
        </div>
      </div>
    </>
  );
};

export default MessageHeader;