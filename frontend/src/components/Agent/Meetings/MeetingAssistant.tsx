/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useEffect } from "react";
import Vapi from "@vapi-ai/web"; // Ensure Vapi is imported
import { MicrophoneIcon, StopCircleIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { startMeetingSession } from "@/lib/AI";
import { useAuth } from "@/context/AuthContext";

const AssistantId = process.env.NEXT_PUBLIC_VAPI_MEETING_SCHEDULE_ASSISTANT_ID; // ✅ new assistant ID for ScheduleMeeting
import { XMarkIcon } from "@heroicons/react/24/outline"; // Import XMarkIcon for closing
import { showErrorToast } from "@/utils/toastHandler";
const token = localStorage.getItem("token");
interface MeetingAssistantProps {
  onClose: () => void;
  onSuccess?: () => void;
}
export default function MeetingAssistant({ onClose }: MeetingAssistantProps) {
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const { user } = useAuth();
  const router = useRouter();
  const [assistantMessage, setAssistantMessage] = useState(
    "Click the mic to start scheduling."
  );

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
      setLoading(false);
      setAssistantMessage("I'm listening... How can I help you?");
    });

    instance.on("call-end", () => {
      setAssistantMessage("Call ended. Review the details below if available.");
      setIsSpeaking(false);
      onClose();
      router.push("/agent/meetings");
    });

    // 👂 Listen for structured output events for ScheduleMeeting
    instance.on("ScheduleMeeting" as any, (event: any) => {
      const result = event?.data?.result || event?.result;
      if (result) {
        setAssistantMessage(
          "I've captured the details. Please review and save."
        );
      }
    });

    // Fallback for generic structured-output event
    instance.on("structured-output" as any, (event: any) => {
      const firstValue: any =
        event && typeof event === "object" ? Object.values(event)[0] : null;
      const data = event?.data?.result || firstValue?.result;
      if (data?.customerName && data?.date) {
        setAssistantMessage(
          "I've captured the details. Please review and save."
        );
      }
    });

    return () => {
      instance.stop().catch(() => {});
    };
  }, [onClose, router]);

  // 🎤 Start assistant session
  const handleStart = useCallback(async () => {
    if (!vapi) return;
    setAssistantMessage("Requesting microphone access...");
    setLoading(true);

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionRes = await startMeetingSession({
        assistantId: AssistantId as string,
        userId: user?._id as string,
      });

      const sessionData = sessionRes?.data ?? sessionRes;
      if (!sessionData?.sessionId) throw new Error("Session creation failed");

      await vapi.start(AssistantId, {
        metadata: { userId: user?.agency?._id, token: token },
      });
    } catch (err) {
      showErrorToast("❌ Failed to start meeting assistant:", err);
      setAssistantMessage("Error starting assistant. Please try again.");
      setLoading(false);
      setIsSpeaking(false);
    }
  }, [vapi]);

  // ⏹️ Stop the assistant
  const handleStop = useCallback(async () => {
    if (!vapi) return;
    try {
      await vapi.stop();
    } catch (err) {
      showErrorToast("Error stopping assistant:", err);
    }
    setIsSpeaking(false);
  }, [vapi]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg md:rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            📅 Meeting Assistant
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Close assistant"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 md:p-6 text-center space-y-4">
          <div className="flex flex-col items-center justify-center space-y-4 min-h-[150px]">
            <div className="relative">
              <button
                onClick={isSpeaking ? handleStop : handleStart}
                disabled={loading}
                className={`relative w-20 h-20 flex items-center justify-center rounded-full text-white transition-all duration-300 z-10 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : isSpeaking
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-primary"
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
            <p className="text-gray-600 text-sm h-10">{assistantMessage}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
