import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorDisplayProps {
  error: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-3 lg:mb-6 flex items-center">
      <AlertCircle className="w-5 h-5 mr-2" />
      <span>{error}</span>
    </div>
  );
};

export default ErrorDisplay;