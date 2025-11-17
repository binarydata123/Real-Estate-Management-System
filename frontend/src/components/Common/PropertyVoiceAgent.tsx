/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useState } from "react";
import Vapi from "@vapi-ai/web";
import { startPreferenceSession } from "@/lib/AI";
import { MicrophoneIcon, StopCircleIcon } from "@heroicons/react/24/solid";
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
  }, [vapi]);

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <button
          onClick={isSpeaking ? handleStop : handleStart}
          disabled={loading || !propertyId}
          className={`w-12 h-12 flex items-center justify-center rounded-full text-white transition-all ${
            loading
              ? "bg-gray-400"
              : isSpeaking
              ? "bg-red-600 hover:bg-red-700"
              : "bg-purple-600 hover:bg-purple-700"
          }`}
          title={isSpeaking ? "Stop Assistant" : "Ask AI Assistant"}
        >
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : isSpeaking ? (
            <StopCircleIcon className="h-7 w-7" />
          ) : (
            <MicrophoneIcon className="h-7 w-7" />
          )}
          {isSpeaking && (
            <div className="absolute inset-0 rounded-full bg-blue-500/50 animate-pulse z-0"></div>
          )}
        </button>
      </div>
      <p className="text-gray-600 text-sm h-10">{assistantMessage}</p>
    </div>
  );
}
