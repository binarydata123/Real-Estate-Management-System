import React from "react";
import { AlertCircle } from "lucide-react";

interface ErrorDisplayProps {
  message: string;
  className?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, className = "" }) => {
  return (
    <div className={`flex-1 flex items-center justify-center p-4 ${className}`}>
      <div className="text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-500">{message}</p>
      </div>
    </div>
  );
};

export default ErrorDisplay;