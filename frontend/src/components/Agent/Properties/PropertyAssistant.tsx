/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useEffect } from "react";
import Vapi from "@vapi-ai/web";
import { startPropertySession } from "@/lib/AI"; // reuse your session starter
import { MicrophoneIcon, StopCircleIcon } from "@heroicons/react/24/solid";
import { Loader2 } from "lucide-react";

const AssistantId = process.env.NEXT_PUBLIC_VAPI_PROPERTY_ASSISTANT_ID; // ✅ new assistant ID for CaptureProperty

export default function PropertyAssistant() {
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [vapi, setVapi] = useState<Vapi | null>(null);

  const [finalJson, setFinalJson] = useState<any>(null);
  const [saveStatus, setSaveStatus] = useState<string>("");

  // ✅ Initialize Vapi once
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_VAPI_API_KEY;
    if (!key) {
      console.error("Missing NEXT_PUBLIC_VAPI_API_KEY");
      return;
    }

    const instance = new Vapi(key);
    setVapi(instance);

    instance.on("error", (err: any) => console.error("⚠️ Vapi error:", err));

    instance.on("call-start", () => {
      console.log("📞 Property assistant started");
      setIsSpeaking(true);
      setLoading(false);
      setFinalJson(null);
      setSaveStatus("");
    });

    instance.on("call-end", () => {
      console.log("✅ Property session ended");
      setIsSpeaking(false);
    });

    // 👂 Listen for structured output events for CaptureProperty
    instance.on("CaptureProperty" as any, (event: any) => {
      console.log("📦 Property Structured Output:", event);
      const result = event?.data?.result || event?.result;
      if (result) {
        console.log("✅ Captured Property Data:", result);
        setFinalJson(result);
      } else {
        console.warn("⚠️ Missing structured data in event:", event);
      }
    });

    // Fallback for generic structured-output event
    instance.on("structured-output" as any, (event: any) => {
      console.log("📦 Generic Structured Output:", event);
      const firstValue: any =
        event && typeof event === "object" ? Object.values(event)[0] : null;
      const data = event?.data?.result || firstValue?.result;
      if (data?.title && data?.type) {
        setFinalJson(data);
        console.log("✅ Property Data Captured:", data);
      }
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
      console.error("❌ Failed to start property assistant:", err);
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
      console.error("Error stopping assistant:", err);
    }
    setIsSpeaking(false);
  }, [vapi]);

  // 💾 Save captured property data manually
  const handleSave = async () => {
    if (!finalJson) return alert("No property data captured yet.");
    setSaveStatus("Saving...");

    try {
      const res = await fetch("/api/vapi/save-property", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalJson),
      });

      const result = await res.json();
      if (result.success) setSaveStatus("✅ Property saved successfully!");
      else setSaveStatus("❌ Save failed: " + result.message);
    } catch (err) {
      console.error(err);
      setSaveStatus("❌ Save failed.");
    }
  };

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

      {finalJson && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-800">
            📋 Captured Property Data
          </h3>
          <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-x-auto">
            {JSON.stringify(finalJson, null, 2)}
          </pre>
          <button
            onClick={handleSave}
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Save Property
          </button>
          {saveStatus && (
            <p className="mt-2 text-sm text-gray-600">{saveStatus}</p>
          )}
        </div>
      )}
    </div>
  );
}
