"use client"

import React from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";

interface InfoPopupProps {
  message: string;
  onClose: () => void;
}

const InfoPopup: React.FC<InfoPopupProps> = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex justify-center items-center z-[9999]">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-80 text-center animate-popup">
        <AiOutlineInfoCircle size={55} className="text-blue-600 mx-auto mb-4" />

        <p className="text-black text-[18px] md:text-[22px] font-semibold mb-6">
          {message
            .split(".")
            .map(
              (line, index) =>
                line.trim() && <div key={index}>{line.trim()}.</div>
            )}
        </p>

        <button
          onClick={onClose}
          className="px-6 py-3 bg-blue-600 text-white text-[18px] md:text-[22px] font-semibold rounded-lg hover:bg-blue-700 transition"
        >
          OK
        </button>
      </div>

      <style jsx>{`
        .animate-popup {
          animation: popup 0.25s ease-out;
        }
        @keyframes popup {
          0% {
            opacity: 0;
            transform: scale(0.85);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default InfoPopup;
