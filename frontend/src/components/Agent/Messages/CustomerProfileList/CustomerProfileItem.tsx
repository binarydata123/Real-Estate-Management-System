"use client";
import React from 'react';
import StatusBadge from '../UI/StatusBadge';

interface CustomerProfileItemProps {
  customer: CustomerFormData;
  isSelected: boolean;
  unreadCount: number;
  onSelect: (conversationId: string) => void;
  onViewCandidate: (candidateId: string, applicationId?: string) => void;
  getTruncatedMessage: (html: string | null | undefined, length?: number) => string;
  currentUserId?: string;
  isMobile?: boolean;
}

const CustomerProfileItem: React.FC<CustomerProfileItemProps> = ({
  customer,
  isSelected,
  unreadCount,
  onSelect,
  isMobile = false
}) => {
  const isDeleted = !customer;

  const handleClick = () => {
    if (!isDeleted) {
      onSelect(customer._id);
      // Automatically hide conversation list in mobile view when a conversation is selected
      if (isMobile) {
        // This will be handled by the parent component through the onSelect callback
      }
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`p-3 md:p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${isSelected
          ? "bg-blue-50 border-r-2 border-primary"
          : ""
        } ${isDeleted ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="font-medium text-gray-900 truncate">
              {customer?.fullName || "Deleted User"}{" "}
              <span
                className="capitalize"
                style={{ fontSize: "13px" }}
              >
                (
                {customer?.role ||
                  "N/A"}
                )
              </span>
            </p>
            <div className="flex items-center space-x-1">
              {unreadCount > 0 && (
                <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
              {/* <span className="text-xs text-gray-500">
                {formatDate(customer.lastMessageAt)}
              </span> */}
            </div>
          </div>

          {customer?.status && (
            <div className="mt-2">
              <StatusBadge status={customer?.status} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerProfileItem;