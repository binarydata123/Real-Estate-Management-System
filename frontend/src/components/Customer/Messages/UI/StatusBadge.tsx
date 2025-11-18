import React from "react";

interface StatusBadgeProps {
  status?: string;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = "" }) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-700";
      case "reviewed":
        return "bg-yellow-100 text-yellow-700";
      case "shortlisted":
        return "bg-purple-100 text-purple-700";
      case "interviewed":
        return "bg-green-100 text-green-700";
      case "hired":
        return "bg-emerald-100 text-emerald-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case "new":
        return "New";
      case "reviewed":
        return "Reviewed";
      case "shortlisted":
        return "Shortlisted";
      case "interviewed":
        return "Interviewed";
      case "hired":
        return "Hired";
      case "rejected":
        return "Rejected";
      default:
        return "Active";
    }
  };

  return (
    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(status)} ${className}`}>
      {getStatusText(status)}
    </span>
  );
};

export default StatusBadge;