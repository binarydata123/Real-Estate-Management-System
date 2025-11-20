"use client";
import { AddPropertyForm } from "@/components/Agent/Properties/AddPropertyForm";
import { AddPropertySelectionModal } from "@/components/Agent/Properties/AddPropertySelectionModal";
import PropertyAssistant from "@/components/Agent/Properties/PropertyAssistant";
// Import the new modal component
import React, { useState } from "react"; // Keep React and useState

export default function Page() {
  const [addMode, setAddMode] = useState<"manual" | "ai" | null>(null); // Initially null, no mode selected
  const [showSelectionModal, setShowSelectionModal] = useState(true); // Show modal on page load

  const handleSelectMode = (mode: "manual" | "ai") => {
    setAddMode(mode);
    setShowSelectionModal(false); // Close modal after selection
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Render the selection modal if no mode is chosen yet */}
      <AddPropertySelectionModal
        isOpen={showSelectionModal}
        onSelectMode={handleSelectMode}
      />

      {/* Conditionally render the form or assistant based on selected mode */}
      {addMode === "manual" ? (
        <AddPropertyForm />
      ) : addMode === "ai" ? (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
          <PropertyAssistant />
        </div>
      ) : null}
    </div>
  );
}
