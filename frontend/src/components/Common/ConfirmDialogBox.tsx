import React from "react";

interface ConfirmDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  heading: string;
  confirmText?: string;
  cancelText?: string;
  description?: string;
  confirmColor?: string; // optional color for confirm button
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onCancel,
  onConfirm,
  heading,
  confirmText = "Confirm",
  cancelText = "Cancel",
  description,
  confirmColor = "bg-blue-600 hover:bg-blue-700", // default color
}) => {
  if (!open) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-gray-800/50 z-50 p-4 sm:p-0"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-white rounded-2xl p-3 md:p-6 max-w-sm w-full shadow-lg">
        {/* Close button */}
        <span
          onClick={onCancel}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 cursor-pointer"
          aria-label="Close"
        >
          ✕
        </span>

        <h2 className="text-lg font-semibold pr-6">{heading}</h2>
        {description && (
          <p className="text-sm text-gray-600 mt-2">{description}</p>
        )}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-white ${confirmColor}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
