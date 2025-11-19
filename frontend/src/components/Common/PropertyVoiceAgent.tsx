/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useState } from "react";
import Vapi from "@vapi-ai/web";
import { startPreferenceSession } from "@/lib/AI";
import { StopCircleIcon } from "@heroicons/react/24/solid";
import { Loader2 } from "lucide-react";
import { showErrorToast } from "@/utils/toastHandler";
import { useAuth } from "@/context/AuthContext";
const AssistantId =
  process.env.NEXT_PUBLIC_PREFERENCE_AND_FEEDBACK_ASSISTANT_ID; // ✅ new assistant ID for ScheduleMeeting

interface Props {
  propertyId: string;
}

export default function PropertyVoiceAgent({ propertyId }: Props) {
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const { user } = useAuth();
  const [assistantMessage, setAssistantMessage] = useState(
    "Connecting to AI assistant..."
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
  }, []);

  const handleStart = useCallback(async () => {
    if (!vapi) return;
    setAssistantMessage("Requesting microphone access...");
    setLoading(true);

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // 1️⃣ Create session first
      const sessionData = await startPreferenceSession({
        assistantId: AssistantId as string,
        userId: user?._id as string,
        propertyId,
      });

      if (!sessionData?.sessionId) throw new Error("Session creation failed");

      // 2️⃣ Start VAPI using the sessionId (IMPORTANT)
      await vapi.start(AssistantId, {
        metadata: {
          userId: user?._id,
          propertyId: propertyId,
          property: sessionData.property,
          preference: sessionData.preference,
        },
      });

      vapi.send({
        type: "add-message",
        message: {
          role: "user",
          content: "start",
        },
      });
    } catch (err) {
      showErrorToast("❌ Failed to start meeting assistant:", err);
      setAssistantMessage("Error starting assistant. Please try again.");
      setLoading(false);
      setIsSpeaking(false);
    }
  }, [vapi, user?._id, propertyId]);

  const handleStop = useCallback(async () => {
    if (!vapi) return;
    try {
      await vapi.stop();
    } catch (err) {
      showErrorToast("Error stopping assistant:", err);
    }
    setIsSpeaking(false);
    setLoading(false);
  }, [vapi]);

  // Auto-start the assistant when the component is ready
  useEffect(() => {
    if (vapi && propertyId && user?._id) {
      handleStart();
    }
  }, [vapi, propertyId, user?._id, handleStart]);

  return (
    <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl border border-gray-200 mb-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <button
          onClick={isSpeaking ? handleStop : handleStart}
          disabled={loading || !propertyId}
          className={`relative w-14 h-14 flex items-center justify-center rounded-full text-white transition-all duration-300 shadow-lg ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : isSpeaking
              ? "bg-red-500 hover:bg-red-600"
              : "bg-gray-400 cursor-not-allowed" // Disabled look before speaking starts
          }`}
          title={isSpeaking ? "Stop Assistant" : "Talk to AI Assistant"}
        >
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : isSpeaking ? (
            <StopCircleIcon className="h-8 w-8" />
          ) : (
            <Loader2 className="h-6 w-6 animate-spin" /> // Show loader initially
          )}
          {isSpeaking && (
            <div className="absolute inset-0 rounded-full bg-red-500/50 animate-pulse z-0"></div>
          )}
        </button>
        <div className="flex-1">
          <p className="font-semibold text-gray-800">AI Property Assistant</p>
          <p className="text-gray-600 text-sm mt-1">{assistantMessage}</p>
        </div>
      </div>
    </div>
  );
}
