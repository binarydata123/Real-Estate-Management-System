import React from "react";
import { Loader } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader className={`${sizeClasses[size]} text-purple-600 animate-spin`} />
    </div>
  );
};

export default LoadingSpinner;