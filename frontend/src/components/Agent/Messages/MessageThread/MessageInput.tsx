"use client";
import React, { useRef, useEffect } from 'react';
import { Paperclip, Send, Loader } from 'lucide-react';
import { FiFile } from 'react-icons/fi';
import Image from 'next/image';

interface MessageInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  selectedFile: File | null;
  filePreview: string | null;
  isSendingMessage: boolean;
  isArchiveMode: boolean;
  isTrashMode: boolean;
  isBlockMode: boolean;
  anotherUserAllowMessage: boolean;
  conversationBlockedByUser: boolean;
  conversationBlockedByOther: boolean;
  onFileSelected: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
  onSendMessage: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  newMessage,
  setNewMessage,
  selectedFile,
  filePreview,
  isSendingMessage,
  isArchiveMode,
  isTrashMode,
  isBlockMode,
  anotherUserAllowMessage,
  conversationBlockedByUser,
  conversationBlockedByOther,
  onFileSelected,
  onRemoveFile,
  onSendMessage
}) => {
  const editableRef = useRef<HTMLDivElement>(null);

  // Sync contentEditable with newMessage state
  useEffect(() => {
    if (editableRef.current) {
      // Only update if the content is different to avoid cursor jumps
      if (editableRef.current.innerHTML !== newMessage) {
        editableRef.current.innerHTML = newMessage;
      }
    }
  }, [newMessage]);

  const isDisabled = 
    isArchiveMode ||
    isTrashMode ||
    conversationBlockedByUser ||
    conversationBlockedByOther ||
    anotherUserAllowMessage === false;

  const getPlaceholderText = () => {
    if (conversationBlockedByUser) return "You have blocked this conversation";
    if (conversationBlockedByOther) return "You are blocked by this user";
    if (isArchiveMode) return "This conversation is archived";
    if (isTrashMode) return "This conversation is deleted";
    return "Type your message...";
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const content = (e.currentTarget as HTMLDivElement).innerHTML;
    setNewMessage(content);
  };

  const handleSend = () => {
    onSendMessage();
    // The input will be cleared when newMessage becomes empty in parent component
  };

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
              <FiFile className="w-16 h-16 text-gray-400" />
              <span className="text-sm text-center px-2">
                {selectedFile.name}
              </span>
            </div>
          )}
          <button
            className={`absolute top-0 right-0 bg-red-500 text-white p-2 rounded-bl hover:bg-red-600 transition ${
              isDisabled ? "pointer-events-none opacity-50" : ""
            }`}
            onClick={onRemoveFile}
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

        <div className="relative md:w-full w-[275px] min-h-[35px] max-h-[100px] border border-gray-300 rounded-lg overflow-auto focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
          {newMessage === "" && (
            <div className="absolute top-0 left-0 px-4 py-2 text-gray-400 pointer-events-none select-none">
              {getPlaceholderText()}
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
              (anotherUserAllowMessage || anotherUserAllowMessage == null)
            }
            onInput={handleInput}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !isDisabled) {
                e.preventDefault();
                handleSend();
              }
            }}
            suppressContentEditableWarning
          />
        </div>

        <button
          onClick={handleSend}
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