"use client";
import React from "react";
import { Message } from "../types/messageTypes";

import { MessageSquare } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import LoadingSpinner from "../UI/LoadingSpinner";
import EmptyState from "../UI/EmptyState";
import MessageItem from "./MessageItem";

interface MessagesListProps {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: React.Ref<HTMLDivElement>;
}

const MessagesList: React.FC<MessagesListProps> = ({
  messages,
  isLoading,
  messagesEndRef,
}) => {
  const { user } = useAuth();

  const firstUnreadIndex = messages.findIndex(
    (m) => !m.isRead && m.receiverId === user?._id
  );

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          icon={<MessageSquare className="w-8 h-8 text-gray-300" />}
          message="No messages yet"
        />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-4">
      {messages.map((message, idx) => {
        if (
          !message.content?.trim() &&
          (!message.attachments || message.attachments.length === 0)
        ) {
          return null;
        }

        return (
          <React.Fragment key={message._id}>
            {idx === firstUnreadIndex && firstUnreadIndex !== -1 && (
              <div key="unread-divider" className="flex items-center my-4">
                <div className="flex-grow border-t border-gray-300" />
                <span className="px-4 text-sm text-gray-500">
                  Unread Messages
                </span>
                <div className="flex-grow border-t border-gray-300" />
              </div>
            )}

            <MessageItem message={message} />
          </React.Fragment>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessagesList;
