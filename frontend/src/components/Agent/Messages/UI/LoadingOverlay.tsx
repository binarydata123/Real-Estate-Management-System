// CompanyMessage/components/UI/LoadingOverlay.tsx
import React from "react";
import LoadingSpinner from "./LoadingSpinner";

const LoadingOverlay: React.FC = () => (
  <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
    <LoadingSpinner size="lg" />
  </div>
);

export default LoadingOverlay;