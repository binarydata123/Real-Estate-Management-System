"use client";
import React from 'react';
import { Archive, Trash2 } from 'lucide-react';
import { TbUserCancel } from 'react-icons/tb';

interface ActionButtonsProps {
  isArchiveMode: boolean;
  isTrashMode: boolean;
  isBlockMode: boolean;
  archiveCount: number;
  deletedCount: number;
  blockedCount: number;
  onArchive: () => void;
  onTrash: () => void;
  onBlock: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  isArchiveMode,
  isTrashMode,
  isBlockMode,
  archiveCount,
  deletedCount,
  blockedCount,
  onArchive,
  onTrash,
  onBlock
}) => {
  return (
    <div className="flex items-center space-x-2 relative">
      <button
        className="relative p-1 text-gray-400 hover:text-gray-600 cursor-pointer group"
        onClick={onArchive}
      >
        <Archive
          className="w-4 h-4"
          style={{ color: `${isArchiveMode ? "black" : "inherit"}` }}
        />
        {archiveCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
            {archiveCount}
          </span>
        )}
        <div className="absolute -top-9 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center justify-center whitespace-nowrap bg-gray-900 text-white text-xs rounded py-1 px-2 z-10 shadow">
          Archive Messages
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      </button>

      <button
        className="relative p-1 text-gray-400 hover:text-gray-600 cursor-pointer group"
        onClick={onBlock}
      >
        <TbUserCancel
          className="w-4 h-4"
          style={{ color: `${isBlockMode ? "black" : "inherit"}` }}
        />
        {blockedCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
            {blockedCount}
          </span>
        )}
        <div className="absolute -top-9 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center justify-center whitespace-nowrap bg-gray-900 text-white text-xs rounded py-1 px-2 z-10 shadow">
          Blocked Messages
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      </button>

      <button
        className="relative p-1 text-gray-400 hover:text-gray-600 cursor-pointer group"
        onClick={onTrash}
      >
        <Trash2
          className="w-4 h-4"
          style={{ color: `${isTrashMode ? "black" : "inherit"}` }}
        />
        {deletedCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
            {deletedCount}
          </span>
        )}
        <div className="absolute -top-9 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center justify-center whitespace-nowrap bg-gray-900 text-white text-xs rounded py-1 px-2 z-10 shadow">
          Deleted Messages
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      </button>
    </div>
  );
};

export default ActionButtons;