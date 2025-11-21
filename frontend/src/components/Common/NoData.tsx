import React, { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  buttonIcon?: ReactNode;
  heading?: string;
  description?: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

export const NoData: React.FC<EmptyStateProps> = ({
  icon,
  buttonIcon,
  heading,
  description,
  buttonText,
  onButtonClick,
}) => {
  return (
    <div className="text-center py-12 px-4 sm:px-6 md:px-0">
      {icon && <div className="mx-auto mb-4 w-fit">{icon}</div>}

      {heading && (
        <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
          {heading}
        </h3>
      )}

      {description && (
        <p className="text-gray-500 text-sm sm:text-base mb-6">{description}</p>
      )}

      {buttonText && onButtonClick && (
        <button
          onClick={onButtonClick}
          className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors text-sm sm:text-base"
        >
          {/* Only show icon if icon is passed for button */}
          {buttonIcon && (
            <span className="mr-2 flex items-center">{buttonIcon}</span>
          )}
          {buttonText}
        </button>
      )}
    </div>
  );
};
