/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useEffect } from "react";
import Vapi from "@vapi-ai/web";
import { startPropertySession } from "@/lib/AI"; // reuse your session starter
import { MicrophoneIcon, StopCircleIcon } from "@heroicons/react/24/solid";
import { Loader2 } from "lucide-react";
import { showErrorToast } from "@/utils/toastHandler";

const AssistantId = process.env.NEXT_PUBLIC_VAPI_PROPERTY_ASSISTANT_ID; // ✅ new assistant ID for CaptureProperty

export default function PropertyAssistant() {
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
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
      setLoading(false);
    });

    instance.on("call-end", () => {
      setIsSpeaking(false);
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
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold text-gray-900">🏡 Property Assistant</h2>
      <p className="text-gray-600">
        Speak with the AI to describe your property. The assistant will collect
        all property details and send them to the backend.
      </p>

      <div className="flex items-center space-x-4">
        <button
          onClick={isSpeaking ? handleStop : handleStart}
          disabled={loading}
          className={`w-12 h-12 flex items-center justify-center rounded-full text-white transition-all ${
            loading
              ? "bg-gray-400"
              : isSpeaking
              ? "bg-red-600 hover:bg-red-700"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : isSpeaking ? (
            <StopCircleIcon className="h-7 w-7" />
          ) : (
            <MicrophoneIcon className="h-7 w-7" />
          )}
        </button>
      </div>
    </div>
  );
}
