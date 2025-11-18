"use client";
import React from "react";
import { Search } from "lucide-react";
import { IoArrowBackSharp } from "react-icons/io5";
import ActionButtons from "./ActionButtons";

interface SearchHeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  isArchiveMode: boolean;
  isTrashMode: boolean;
  isBlockMode: boolean;
  archiveCount: number;
  deletedCount: number;
  blockedCount: number;
  onFetchConversations: () => void;
  onFetchArchived: () => void;
  onFetchDeleted: () => void;
  onFetchBlocked: () => void;
  onSetArchiveMode: (mode: boolean) => void;
  onSetTrashMode: (mode: boolean) => void;
  onSetBlockMode: (mode: boolean) => void;
  onSetShowConversationList: (show: boolean) => void;
}

const SearchHeader: React.FC<SearchHeaderProps> = ({
  searchTerm,
  onSearchChange,
  isArchiveMode,
  isTrashMode,
  isBlockMode,
  archiveCount,
  deletedCount,
  blockedCount,
  onFetchConversations,
  onFetchArchived,
  onFetchDeleted,
  onFetchBlocked,
  onSetArchiveMode,
  onSetTrashMode,
  onSetBlockMode
}) => {
  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between p-2 border-b border-gray-200">
        <div className="flex items-center">
          {(isArchiveMode || isTrashMode || isBlockMode) && (
            <div>
              <button
                type="button"
                className="text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-full text-sm p-1.5 text-center inline-flex items-center me-2 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
                onClick={() => {
                  onSetArchiveMode(false);
                  onSetTrashMode(false);
                  onSetBlockMode(false);
                  onFetchConversations();
                }}
              >
                <IoArrowBackSharp />
              </button>
            </div>
          )}
          <h3 className="font-semibold text-gray-900">
            {isArchiveMode
              ? "Archived Messages"
              : isTrashMode
              ? "Deleted Messages"
              : isBlockMode
              ? "Blocked Messages"
              : "Conversations"}
          </h3>
        </div>
        <div className="lg:hidden flex items-center justify-between">
          <ActionButtons
            isArchiveMode={isArchiveMode}
            isTrashMode={isTrashMode}
            isBlockMode={isBlockMode}
            archiveCount={archiveCount}
            deletedCount={deletedCount}
            blockedCount={blockedCount}
            onFetchArchived={onFetchArchived}
            onFetchDeleted={onFetchDeleted}
            onFetchBlocked={onFetchBlocked}
            onSetArchiveMode={onSetArchiveMode}
            onSetTrashMode={onSetTrashMode}
            onSetBlockMode={onSetBlockMode}
            variant="mobile"
          />
        </div>
      </div>

      <div className="p-2 md:p-4 border-b border-gray-200">
        <div className="relative mb-2 md:mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          />
        </div>
        <div className="hidden lg:flex items-center justify-between">
          <div className="flex">
            {(isArchiveMode || isTrashMode || isBlockMode) && (
              <div className="">
                <button
                  type="button"
                  className="text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-full text-sm p-1.5 text-center inline-flex items-center me-2 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
                  onClick={() => {
                    onSetArchiveMode(false);
                    onSetTrashMode(false);
                    onSetBlockMode(false);
                    onFetchConversations();
                  }}
                >
                  <IoArrowBackSharp />
                </button>
              </div>
            )}
            <h3 className="font-semibold text-gray-900 hidden lg:block">
              {isArchiveMode
                ? "Archived Messages"
                : isTrashMode
                ? "Deleted Messages"
                : isBlockMode
                ? "Blocked Messages"
                : "Conversations"}
            </h3>
          </div>
          <ActionButtons
            isArchiveMode={isArchiveMode}
            isTrashMode={isTrashMode}
            isBlockMode={isBlockMode}
            archiveCount={archiveCount}
            deletedCount={deletedCount}
            blockedCount={blockedCount}
            onFetchArchived={onFetchArchived}
            onFetchDeleted={onFetchDeleted}
            onFetchBlocked={onFetchBlocked}
            onSetArchiveMode={onSetArchiveMode}
            onSetTrashMode={onSetTrashMode}
            onSetBlockMode={onSetBlockMode}
            variant="desktop"
          />
        </div>
      </div>
    </>
  );
};

export default SearchHeader;