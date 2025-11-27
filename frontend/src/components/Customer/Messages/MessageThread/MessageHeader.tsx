"use client";
import React from "react";
import { Conversation } from "../types/messageTypes";
import { Tooltip } from "react-tooltip";
import Image from "next/image";

interface MessageHeaderProps {
  selectedConversation: Conversation | undefined;
  showProfile: boolean;
  onArchiveConversation: (id: string) => void;
  onUnarchiveConversation: (id: string) => void;
  onBlockConversation: (id: string) => void;
  onUnblockConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onRestoreConversation: (id: string) => void;
}

const MessageHeader: React.FC<MessageHeaderProps> = ({
  selectedConversation,
  showProfile,
}) => {
  return (
    <div className="p-2 md:p-4 border-b border-gray-200 bg-gray-50 flex items-center">
      <div className="flex-1 flex items-center space-x-3 min-w-0 overflow-hidden">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
          {selectedConversation?.otherParticipant?.avatar &&
          /^https?:\/\//.test(
            selectedConversation?.otherParticipant?.avatar
          ) ? (
            <Image
              src={selectedConversation?.otherParticipant?.avatar}
              alt={selectedConversation?.otherParticipant?.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xl">
              {selectedConversation?.otherParticipant?.name?.charAt(0) || "👤"}
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
            >
              {selectedConversation?.otherParticipant?.name || "Deleted User"}
              <span style={{ fontSize: "13px" }}>
                (
                {selectedConversation?.otherParticipant?.position ||
                  selectedConversation?.otherParticipant?.role}
                )
              </span>
            </h3>

            <Tooltip
              anchorSelect="#viewProfileTooltip"
              place="right"
              content={
                showProfile
                  ? `Click to view profile`
                  : "User don't allow others to view profile"
              }
            />
          </div>
          <p className="text-sm text-gray-600 truncate">
            {selectedConversation?.otherParticipant?.application?.jobTitle
              ? `Applied for: ${selectedConversation?.otherParticipant.application?.jobTitle}`
              : "Direct conversation"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MessageHeader;
