"use client";
import React from 'react';
import { Archive, Trash2 } from 'lucide-react';
import { TbUserCancel } from 'react-icons/tb';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

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
      <Tippy content="Archive Messages" placement="top" animation="shift-away" theme="light-border">
        <button
          className="relative p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
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
        </button>
      </Tippy>

      <Tippy content="Blocked Messages" placement="top" animation="shift-away" theme="light-border">
        <button
          className="relative p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
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
        </button>
      </Tippy>

      <Tippy content="Deleted Messages" placement="top" animation="shift-away" theme="light-border">
        <button
          className="relative p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
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
        </button>
      </Tippy>
    </div>
  );
};

export default ActionButtons;