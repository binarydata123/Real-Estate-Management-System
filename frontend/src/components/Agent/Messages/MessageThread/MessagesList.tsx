"use client";
import React, { useRef, useEffect } from "react";
import MessageItem from "./MessageItem";

import { MessageSquare } from "lucide-react";
import { Message } from "../types/messageTypes";
import LoadingSpinner from "../UI/LoadingSpinner";
import EmptyState from "../UI/EmptyState";

interface MessagesListProps {
  messages: Message[];
  isLoadingMessages: boolean;
  currentUserId?: string;
  firstUnreadIndex: number;
}

const MessagesList: React.FC<MessagesListProps> = ({
  messages,
  isLoadingMessages,
  currentUserId,
  firstUnreadIndex,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isLoadingMessages) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <EmptyState
        icon={<MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />}
        title="Your chat starts here 👋"
        description="Start the conversation by sending a message"
      />
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-4">
      {messages.map((message, idx) => {
        const isUnread =
          !message.isRead && message.receiverId === currentUserId;
        const isOwnMessage = message.senderId === currentUserId;

        return (
          <React.Fragment key={message._id}>
            {idx === firstUnreadIndex && firstUnreadIndex !== -1 && (
              <div className="flex items-center my-4">
                <div className="flex-grow border-t border-gray-300" />
                <span className="px-4 text-sm text-gray-500">
                  Unread Messages
                </span>
                <div className="flex-grow border-t border-gray-300" />
              </div>
            )}

            <MessageItem
              message={message}
              isOwnMessage={isOwnMessage}
              isUnread={isUnread}
              currentUserId={currentUserId}
            />
          </React.Fragment>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessagesList;
