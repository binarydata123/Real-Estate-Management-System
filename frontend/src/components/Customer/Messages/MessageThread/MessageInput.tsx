"use client";
import React, { useRef, useEffect } from "react";
import { Conversation } from "../types/messageTypes";
import { Paperclip, Send, Loader } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

interface MessageInputProps {
  newMessage: string;
  selectedFile: File | null;
  filePreview: string | null;
  isSendingMessage: boolean;
  isArchiveMode: boolean;
  isTrashMode: boolean;
  isBlockMode: boolean;
  selectedConversation: Conversation;
  anotherUserAllowMessage: boolean;
  isFirstMessageEmpty: boolean;
  onMessageChange: (message: string) => void;
  onFileSelected: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSendMessage: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  newMessage,
  selectedFile,
  filePreview,
  isSendingMessage,
  isArchiveMode,
  isTrashMode,
  isBlockMode,
  selectedConversation,
  anotherUserAllowMessage,
  isFirstMessageEmpty,
  onMessageChange,
  onFileSelected,
  onSendMessage,
}) => {
  const { user } = useAuth();
  const editableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editableRef.current && newMessage === "") {
      editableRef.current.innerHTML = "";
    }
  }, [newMessage]);

  const isBlockedByUser = selectedConversation?.blockedBy?.includes(user?._id as string);
  const isBlockedByOther = selectedConversation?.blockedBy?.includes(
    selectedConversation.otherParticipant?._id as string
  );

  const isDisabled =
    isArchiveMode ||
    isTrashMode ||
    isBlockMode ||
    isBlockedByUser ||
    isBlockedByOther ||
    (anotherUserAllowMessage == false);

  return (
    <div className="p-2 md:p-4 border-t border-gray-200 relative">
      {selectedFile && (
        <div className="mb-4 lg:w-48 lg:h-48 w-28 h-28 border rounded overflow-hidden shadow-lg relative flex items-center justify-center bg-gray-100">
          {filePreview ? (
            <Image
              src={filePreview}
              alt="Preview"
              className="w-full h-full object-cover"
              width={280}
              height={280}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-600">
              <svg
                className="w-16 h-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h10M7 11h10M7 15h4m5-11H6a2 2 0 00-2 2v14l4-4h10a2 2 0 002-2V6a2 2 0 00-2-2z"
                />
              </svg>
              <span className="text-sm text-center px-2">
                {selectedFile.name}
              </span>
            </div>
          )}
          <button
            className={`absolute top-0 right-0 bg-red-500 text-white p-2 rounded-bl hover:bg-red-600 transition ${
              isDisabled ? "pointer-events-none opacity-50" : ""
            }`}
            onClick={() => {
              // This would need to be handled by the parent
              // For now, we'll trigger file selection with null
              const input = document.createElement('input');
              input.type = 'file';
              input.click();
            }}
            title="Remove attachment"
            disabled={isDisabled}
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <label
          className={`p-2 text-gray-400 hover:text-gray-600 cursor-pointer relative ${
            isDisabled ? "pointer-events-none opacity-50" : ""
          }`}
        >
          <Paperclip className="w-5 h-5" />
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={onFileSelected}
            disabled={isDisabled}
          />
        </label>
        <div className="relative w-full min-h-[35px] max-h-[100px] border border-gray-300 rounded-lg overflow-auto focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
          {newMessage === "" && (
            <div className="absolute top-0 left-0 px-4 py-2 text-gray-400 pointer-events-none select-none">
              {isBlockedByUser
                ? "You have blocked this conversation"
                : isBlockedByOther
                ? "You are blocked by this user"
                : isArchiveMode
                ? "This conversation is archived"
                : isTrashMode
                ? "This conversation is deleted"
                : isFirstMessageEmpty
                ? `You can reply once the ${selectedConversation.otherParticipant?.role} sends the first message.`
                : "Type your message..."}
            </div>
          )}
          <div
            ref={editableRef}
            className={`w-full px-4 py-2 outline-none ${
              isDisabled ? "pointer-events-none opacity-50" : ""
            }`}
            contentEditable={
              !isSendingMessage &&
              !isDisabled &&
              !isFirstMessageEmpty &&
              (anotherUserAllowMessage || anotherUserAllowMessage == null)
            }
            onPaste={(e) => {
              e.preventDefault();
              const clipboardData = e.clipboardData || (window as any).clipboardData;
              const text = clipboardData.getData("text/plain");
              document.execCommand("insertText", false, text);
            }}
            onInput={(e) => onMessageChange((e.target as HTMLElement).innerHTML)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !isDisabled && !isFirstMessageEmpty) {
                e.preventDefault();
                onSendMessage();
              }
            }}
            suppressContentEditableWarning
          />
        </div>
        <button
          onClick={onSendMessage}
          disabled={
            isDisabled ||
            (!newMessage.trim() && !selectedFile) ||
            isSendingMessage
          }
          className={`p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 ${
            isDisabled ? "cursor-not-allowed" : ""
          }`}
        >
          {isSendingMessage ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default MessageInput;