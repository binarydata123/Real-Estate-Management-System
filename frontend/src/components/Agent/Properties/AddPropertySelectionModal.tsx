"use client";
import React from "react";
import { Dialog } from "@headlessui/react";
import { Edit, Wand2 } from "lucide-react";

interface AddPropertySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode: (mode: "manual" | "ai") => void;
}

export const AddPropertySelectionModal: React.FC<
  AddPropertySelectionModalProps
> = ({ isOpen, onClose, onSelectMode }) => {
  if (!isOpen) return null;
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Full-screen container to center the panel */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        {/* The actual dialog panel  */}
        <Dialog.Panel className="w-full max-w-2xl rounded-2xl bg-gradient-to-br from-gray-50 to-blue-50 p-8 shadow-2xl">
          <Dialog.Title className="text-center text-2xl font-bold text-gray-800 mb-2">
            Choose Your Path to Add a Property
          </Dialog.Title>
          <Dialog.Description className="text-center text-gray-600 mb-8">
            Select your preferred method for listing a new property.
          </Dialog.Description>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Manual Entry Card */}
            <button
              onClick={() => onSelectMode("manual")}
              className="group flex flex-col items-center text-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-primary hover:-translate-y-1 transition-all duration-300"
            >
              <div className="bg-gray-100 p-4 rounded-full mb-4 group-hover:bg-gray-200 transition-colors">
                <Edit className="w-8 h-8 text-gray-600 group-hover:text-gray-800" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Manual Entry
              </h3>
              <p className="text-sm text-gray-500">
                Fill out the property details yourself using our guided form.
              </p>
            </button>
            {/* AI Assistant Card */}
            <button
              onClick={() => onSelectMode("ai")}
              className="group flex flex-col items-center text-center p-6 bg-primary text-white rounded-xl shadow-lg hover:shadow-blue-400/50 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="bg-primary p-4 rounded-full mb-4 group-hover:bg-blue-400 transition-colors">
                <Wand2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Use AI Assistant</h3>
              <p className="text-sm text-blue-100">
                Let our AI guide you through the process with a conversation.
              </p>
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
