"use client";
import React from "react";
import { Conversation } from "../types/messageTypes";
import { Tooltip } from "react-tooltip";
import { useAuth } from "@/context/AuthContext";
import { getInitial } from "@/helper/getInitialForProfile";

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
  const { user } = useAuth();
  return (
    <div className="p-2 md:p-4 border-b border-gray-200 bg-gray-50 flex items-center">
      <div className="flex-1 flex items-center space-x-3 min-w-0 overflow-hidden">
        <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
          {getInitial(user?.name)}
          {/* </div> */}
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
              {selectedConversation?.otherParticipant?.name || user?.agency?.name}
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
        </div>
      </div>
    </div>
  );
};

export default MessageHeader;
