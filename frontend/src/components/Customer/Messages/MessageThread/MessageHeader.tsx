"use client";
import React, { useState } from "react";
import { Conversation } from "../types/messageTypes";
import { MoreVertical } from "lucide-react";
import { IoArrowBackSharp } from "react-icons/io5";
import { Tooltip } from "react-tooltip";
import { useAuth } from "@/context/AuthContext";
import StatusBadge from "../UI/StatusBadge";
import Image from "next/image";

interface MessageHeaderProps {
  selectedConversation: Conversation;
  showConversationList: boolean;
  showProfile: boolean;
  onSetShowConversationList: (show: boolean) => void;
  onViewCompany: (companyId: string) => void;
  onArchiveConversation: (id: string) => void;
  onUnarchiveConversation: (id: string) => void;
  onBlockConversation: (id: string) => void;
  onUnblockConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onRestoreConversation: (id: string) => void;
}

const MessageHeader: React.FC<MessageHeaderProps> = ({
  selectedConversation,
  showConversationList,
  showProfile,
  onSetShowConversationList,
  onViewCompany,
  onArchiveConversation,
  onUnarchiveConversation,
  onBlockConversation,
  onUnblockConversation,
  onDeleteConversation,
  onRestoreConversation,
}) => {
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const { user } = useAuth();

  return (
    <div className="p-2 md:p-4 border-b border-gray-200 bg-gray-50 flex items-center">
      <button
        className="lg:hidden p-1 mr-2 text-gray-600"
        onClick={() => onSetShowConversationList(true)}
      >
        <IoArrowBackSharp className="w-5 h-5" />
      </button>
      <div className="flex-1 flex items-center space-x-3 min-w-0 overflow-hidden">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
          {selectedConversation.otherParticipant?.avatar &&
          /^https?:\/\//.test(selectedConversation.otherParticipant?.avatar) ? (
            <Image
              src={selectedConversation.otherParticipant?.avatar}
              alt={selectedConversation.otherParticipant?.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xl">
              {selectedConversation.otherParticipant?.name?.charAt(0) || "👤"}
            </span>
          )}
        </div>
        <div className="min-w-0 overflow-hidden">
          <div className="flex items-center space-x-2">
            <h3
              className="font-semibold text-gray-900 truncate capitalize hover:text-gray-800 cursor-pointer"
              id="viewProfileTooltip"
              style={{
                cursor: showProfile ? "pointer" : "not-allowed",
                opacity: showProfile ? 1 : 0.5,
              }}
              onClick={() => {
                if (selectedConversation.otherParticipant?.role !== "admin") {
                  showProfile && onViewCompany(selectedConversation.otherParticipant?._id);
                }
              }}
            >
              {selectedConversation.otherParticipant?.name || "Deleted User"}
              <span style={{ fontSize: "13px" }}>
                ({selectedConversation.otherParticipant?.position || selectedConversation.otherParticipant?.role})
              </span>
            </h3>

            <Tooltip
              anchorSelect="#viewProfileTooltip"
              place="right"
              content={
                showProfile ? `Click to view profile` : "User don't allow others to view profile"
              }
            />
          </div>
          <p className="text-sm text-gray-600 truncate">
            {selectedConversation.otherParticipant?.application?.jobTitle
              ? `Applied for: ${selectedConversation.otherParticipant.application?.jobTitle}`
              : "Direct conversation"}
          </p>
        </div>
      </div>

      {/* <div className="flex items-center space-x-2 md:ml-2">
        {selectedConversation.otherParticipant?.status && (
          <StatusBadge
            status={selectedConversation.otherParticipant.status}
            className="hidden md:flex"
          />
        )}
        <div className="relative">
          <button
            className="p-1 text-gray-400 hover:text-gray-600"
            onClick={() => setShowMenu(showMenu === selectedConversation._id ? null : selectedConversation._id)}
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {showMenu === selectedConversation._id && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(null)} />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 py-1 border border-gray-200">
                {selectedConversation.deletedBy?.includes(user?._id as string) ? (
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-gray-100"
                    onClick={() => onRestoreConversation(selectedConversation._id)}
                  >
                    Restore Conversation
                  </button>
                ) : selectedConversation.blockedBy?.includes(user?._id as string) ? (
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-gray-100"
                    onClick={() => onUnblockConversation(selectedConversation._id)}
                  >
                    Unblock Conversation
                  </button>
                ) : (
                  <>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() =>
                        selectedConversation.archivedBy?.includes(user?._id as string)
                          ? onUnarchiveConversation(selectedConversation._id)
                          : onArchiveConversation(selectedConversation._id)
                      }
                    >
                      {selectedConversation.archivedBy?.includes(user?._id as string)
                        ? "Unarchive Conversation"
                        : "Archive Conversation"}
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => onBlockConversation(selectedConversation._id)}
                    >
                      Block Conversation
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      onClick={() => onDeleteConversation(selectedConversation._id)}
                    >
                      Delete Conversation
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div> */}
    </div>
  );
};

export default MessageHeader;