import React from 'react';
import { MessageSquare } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon, 
  title, 
  description 
}) => {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="text-center">
        {icon || <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />}
        <p className="text-gray-500">{title}</p>
        {description && <p className="text-sm text-gray-400 mt-1">{description}</p>}
      </div>
    </div>
  );
};

export default EmptyState;