"use client";
import React from 'react';
import { Search } from 'lucide-react';
import { IoArrowBackSharp } from 'react-icons/io5';
import ActionButtons from './ActionButtons';

interface SearchHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isArchiveMode: boolean;
  isTrashMode: boolean;
  isBlockMode: boolean;
  onBack: () => void;
  showActions?: boolean;
  archiveCount: number;
  deletedCount: number;
  blockedCount: number;
  onArchive: () => void;
  onTrash: () => void;
  onBlock: () => void;
  isMobile?: boolean;
}

const SearchHeader: React.FC<SearchHeaderProps> = ({
  searchTerm,
  setSearchTerm,
  isArchiveMode,
  isTrashMode,
  isBlockMode,
  onBack,
  showActions = true,
  archiveCount,
  deletedCount,
  blockedCount,
  onArchive,
  onTrash,
  onBlock,
  isMobile = false
}) => {
  return (
    <div className="p-2 md:p-4 border-b border-gray-200">
      <div className="relative mb-2 md:mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
        />
      </div>
      
      {/* Only show header actions in desktop view */}
      {!isMobile && (
        <div className="flex items-center justify-between">
          <div className="flex">
            {(isArchiveMode || isTrashMode || isBlockMode) && (
              <div className="">
                <button
                  type="button"
                  className="text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-full text-sm p-1.5 text-center inline-flex items-center me-2 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
                  onClick={onBack}
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
          
          {showActions && (
            <ActionButtons
              isArchiveMode={isArchiveMode}
              isTrashMode={isTrashMode}
              isBlockMode={isBlockMode}
              archiveCount={archiveCount}
              deletedCount={deletedCount}
              blockedCount={blockedCount}
              onArchive={onArchive}
              onTrash={onTrash}
              onBlock={onBlock}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default SearchHeader;