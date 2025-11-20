/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useCallback, useEffect } from "react";
import Vapi from "@vapi-ai/web";
import { startCustomerSession } from "@/lib/AI";
import { MicrophoneIcon, StopCircleIcon } from "@heroicons/react/24/solid";
import { Loader2, X } from "lucide-react";
import { showErrorToast } from "@/utils/toastHandler";
const AssistantId = process.env.NEXT_PUBLIC_VAPI_CUSTOMER_ASSISTANT_ID;

interface CustomerAssistantProps {
  onClose: () => void;
}

export default function CustomerAssistant({ onClose }: CustomerAssistantProps) {
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [assistantStatus, setAssistantStatus] = useState("idle");
  const [vapi, setVapi] = useState<Vapi | null>(null);

  // ✅ Initialize Vapi once
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_VAPI_API_KEY;
    if (!key) {
      showErrorToast("Missing NEXT_PUBLIC_VAPI_API_KEY");
      return;
    }

    const instance = new Vapi(key);
    setVapi(instance);

    instance.on("error", (err: any) => showErrorToast("⚠️ Vapi error:", err));
    instance.on("call-start", () => {
      setIsSpeaking(true);
      setAssistantStatus("speaking");
      setLoading(false);
    });

    instance.on("call-end", () => {
      setAssistantStatus("idle");
      setIsSpeaking(false);
    });

    return () => {
      instance.stop().catch(() => {});
    };
  }, []);

  const handleStart = useCallback(async () => {
    if (!vapi) return;
    setLoading(true);
    setAssistantStatus("connecting");
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const sessionRes = await startCustomerSession({
        assistantId: AssistantId as string,
      });
      const sessionData = sessionRes?.data ?? sessionRes;
      if (!sessionData?.sessionId) throw new Error("Session creation failed");

      await (vapi as any).start(AssistantId);
    } catch (e) {
      showErrorToast("❌ Failed to start assistant:", e);
      setLoading(false);
      setIsSpeaking(false);
      setAssistantStatus("idle");
    }
  }, [vapi]);

  const handleStop = useCallback(async () => {
    if (!vapi) return;
    try {
      await vapi.stop();
    } catch (err) {
      showErrorToast("Error stopping assistant:", err);
    }
    setIsSpeaking(false);
    setAssistantStatus("idle");
  }, [vapi]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Add Customer with AI
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-center">
          <p className="text-gray-600 mb-8">
            Simply talk to our AI assistant. It will ask for the customer&apos;s
            details and handle the data entry for you.
          </p>

          <div className="flex flex-col items-center justify-center space-y-4 min-h-[150px]">
            <div className="relative">
              <button
                onClick={isSpeaking ? handleStop : handleStart}
                disabled={loading}
                className={`relative w-20 h-20 flex items-center justify-center rounded-full text-white transition-all duration-300 z-10 shadow-lg ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : isSpeaking
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
                aria-label={isSpeaking ? "Stop assistant" : "Start assistant"}
              >
                {loading ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : isSpeaking ? (
                  <StopCircleIcon className="h-10 w-10" />
                ) : (
                  <MicrophoneIcon className="h-10 w-10" />
                )}
              </button>
              {isSpeaking && (
                <div className="absolute inset-0 rounded-full bg-blue-500/50 animate-pulse z-0"></div>
              )}
            </div>
            <p className="text-gray-600 text-sm h-10">
              {assistantStatus === "connecting" && "Connecting..."}
              {assistantStatus === "speaking" &&
                "Listening... Feel free to speak."}
              {assistantStatus === "idle" && "Click the microphone to start."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
