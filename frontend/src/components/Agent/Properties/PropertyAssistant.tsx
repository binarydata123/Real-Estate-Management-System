/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useEffect } from "react";
import Vapi from "@vapi-ai/web";
import { startPropertySession } from "@/lib/AI"; // reuse your session starter
import { MicrophoneIcon, StopCircleIcon } from "@heroicons/react/24/solid";
import { Loader2 } from "lucide-react";
import { showErrorToast } from "@/utils/toastHandler";
const AssistantId = process.env.NEXT_PUBLIC_VAPI_PROPERTY_ASSISTANT_ID;

export default function PropertyAssistant() {
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [assistantStatus, setAssistantStatus] = useState("idle");
  const [vapi, setVapi] = useState<Vapi | null>(null);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_VAPI_API_KEY;
    if (!key) {
      showErrorToast("Missing NEXT_PUBLIC_VAPI_API_KEY");
      return;
    }

    const instance = new Vapi(key);
    setVapi(instance);

    instance.on("call-start", () => {
      setIsSpeaking(true);
      setLoading(false);
      setAssistantStatus("speaking");
    });

    instance.on("call-end", () => {
      setIsSpeaking(false);
      setAssistantStatus("idle");
    });

    instance.on("error", (err: any) => {
      showErrorToast("Vapi Error", err);
      setIsSpeaking(false);
      setLoading(false);
      setAssistantStatus("idle");
    });

    return () => {
      instance.stop().catch(() => {});
    };
  }, []);

  // 🎤 Start assistant session
  const handleStart = useCallback(async () => {
    if (!vapi) return;
    setLoading(true);
    setAssistantStatus("connecting");

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionRes = await startPropertySession({
        assistantId: AssistantId as string,
      });

      const sessionData = sessionRes?.data ?? sessionRes;
      if (!sessionData?.sessionId) throw new Error("Session creation failed");

      await (vapi as any).start(AssistantId);
    } catch (err) {
      showErrorToast("❌ Failed to start property assistant:", err);
      setLoading(false);
      setIsSpeaking(false);
      setAssistantStatus("idle");
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
    setAssistantStatus("idle");
  }, [vapi]);

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 md:p-8 rounded-2xl text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Create Property with AI
      </h2>
      <p className="text-gray-600 mb-8 max-w-lg mx-auto">
        Simply talk to our AI assistant. Describe the property, and it will
        handle the data entry for you.
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
          {assistantStatus === "speaking" && "Listening... Feel free to speak."}
          {assistantStatus === "idle" &&
            "Click the microphone to start the conversation."}
        </p>
      </div>
    </div>
  );
}
