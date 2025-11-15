/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useEffect } from "react";
import Vapi from "@vapi-ai/web";
import { startPropertySession } from "@/lib/AI"; // reuse your session starter
import { MicrophoneIcon, StopCircleIcon } from "@heroicons/react/24/solid";
import { Loader2 } from "lucide-react";
import { showErrorToast } from "@/utils/toastHandler";
const AssistantId = process.env.NEXT_PUBLIC_VAPI_PROPERTY_ASSISTANT_ID;

interface PropertyAssistantProps {
  propertyId: string;
}

export default function PropertyAssistant({
  propertyId,
}: PropertyAssistantProps) {
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
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-700">AI Assistant</p>
          <div className="text-sm text-gray-500">
            {assistantStatus === "thinking" && <p>Thinking...</p>}
            {assistantStatus === "speaking" && <p>Speaking...</p>}
            {assistantStatus === "idle" && (
              <p>Click the mic to ask questions about this property.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
