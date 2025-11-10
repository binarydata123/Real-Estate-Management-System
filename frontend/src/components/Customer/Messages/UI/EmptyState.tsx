import React, { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title?: string;
  message: string;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center h-full text-center p-6 ${className}`}
    >
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="flex items-center justify-center">{icon}</div>
        {title && (
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        )}
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default EmptyState;
