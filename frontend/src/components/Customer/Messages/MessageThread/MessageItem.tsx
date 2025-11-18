"use client";
import React from "react";
import { Message } from "../types/messageTypes";
import { Circle, CheckCircle2 } from "lucide-react";
import { FiFile } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { formatDateToReadable } from "../../../../services/formatters";
import Image from "next/image";

interface MessageItemProps {
  message: Message;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const { user } = useAuth();

  const isUnread = !message.isRead && message.receiverId === user?._id;
  const isSender = message.senderId === user?._id;

  return (
    <div className={`flex ${isSender ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg
          ${
            isSender
              ? "bg-blue-600 text-white"
              : isUnread
              ? "bg-indigo-50 text-gray-900"
              : "bg-gray-100 text-gray-900"
          }`}
      >
        {message.content && message.content !== "" && (
          <div
            className="text-sm mb-2 break-words prose prose-sm max-w-full"
            dangerouslySetInnerHTML={{
              __html: message.content,
            }}
          />
        )}

        {message.attachments && message.attachments.length > 0 && (
          <div className="space-y-2">
            {message.attachments.map((att, i) => (
              <div key={i}>
                {att.type.startsWith("image/") ? (
                  <Image
                    src={att.url}
                    alt={att.name}
                    className="max-w-56 rounded-md border"
                    width={224}
                    height={224}
                  />
                ) : (
                  <a
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center space-x-2 p-2 bg-white rounded-md border hover:bg-gray-50 transition"
                  >
                    <FiFile className="w-16 h-16 text-gray-500 flex-shrink-0" />
                    <span className="text-blue-500 underline break-all">
                      {att.name}
                    </span>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-1">
          <span
            className={`text-xs ${
              isSender ? "text-blue-200" : "text-gray-500"
            }`}
          >
            {formatDateToReadable(message.createdAt)}
          </span>
          {isSender && (
            <div className="ml-2">
              {message.isRead ? (
                <CheckCircle2 className="w-3 h-3 text-blue-200" />
              ) : (
                <Circle className="w-3 h-3 text-blue-200" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;