"use client";
import React from "react";
import { Archive, Trash2 } from "lucide-react";
import { TbUserCancel } from "react-icons/tb";

interface ActionButtonsProps {
  isArchiveMode: boolean;
  isTrashMode: boolean;
  isBlockMode: boolean;
  archiveCount: number;
  deletedCount: number;
  blockedCount: number;
  onFetchArchived: () => void;
  onFetchDeleted: () => void;
  onFetchBlocked: () => void;
  onSetArchiveMode: (mode: boolean) => void;
  onSetTrashMode: (mode: boolean) => void;
  onSetBlockMode: (mode: boolean) => void;
  variant: "mobile" | "desktop";
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  isArchiveMode,
  isTrashMode,
  isBlockMode,
  archiveCount,
  deletedCount,
  blockedCount,
  onFetchArchived,
  onFetchDeleted,
  onFetchBlocked,
  onSetArchiveMode,
  onSetTrashMode,
  onSetBlockMode,
  variant,
}) => {
  const buttons = [
    {
      icon: Archive,
      count: archiveCount,
      active: isArchiveMode,
      onClick: () => {
        onFetchArchived();
        onSetArchiveMode(true);
        onSetTrashMode(false);
        onSetBlockMode(false);
      },
      tooltip: "Archive Messages",
    },
    {
      icon: TbUserCancel,
      count: blockedCount,
      active: isBlockMode,
      onClick: () => {
        onFetchBlocked();
        onSetArchiveMode(false);
        onSetBlockMode(true);
        onSetTrashMode(false);
      },
      tooltip: "Blocked Messages",
    },
    {
      icon: Trash2,
      count: deletedCount,
      active: isTrashMode,
      onClick: () => {
        onFetchDeleted();
        onSetTrashMode(true);
        onSetArchiveMode(false);
        onSetBlockMode(false);
      },
      tooltip: "Deleted Messages",
    },
  ];

  if (variant === "mobile") {
    return (
      <div className="flex items-center space-x-2 relative">
        {buttons.map((button, index) => (
          <button
            key={index}
            className="relative p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
            onClick={button.onClick}
          >
            <button.icon
              className="w-4 h-4"
              style={{ color: `${button.active ? "black" : "inherit"}` }}
            />
            {button.count > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                {button.count}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 relative">
      {buttons.map((button, index) => (
        <button
          key={index}
          className="relative p-1 text-gray-400 hover:text-gray-600 cursor-pointer group"
          onClick={button.onClick}
        >
          <button.icon
            className="w-4 h-4"
            style={{ color: `${button.active ? "black" : "inherit"}` }}
          />
          {button.count > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
              {button.count}
            </span>
          )}
          <div className="absolute -top-9 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center justify-center whitespace-nowrap bg-gray-900 text-white text-xs rounded py-1 px-2 z-10 shadow">
            {button.tooltip}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default ActionButtons;