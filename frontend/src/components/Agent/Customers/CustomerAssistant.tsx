/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useCallback, useEffect } from "react";
import Vapi from "@vapi-ai/web";
import { startCustomerSession } from "@/lib/AI";
import { MicrophoneIcon, StopCircleIcon } from "@heroicons/react/24/solid";
import { Loader2 } from "lucide-react";
const AssistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
export default function CustomerAssistant() {
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
    console.log(instance, "fasdfafdaa");

    instance.on("error", (err: any) => console.error("⚠️ Vapi error:", err));
    instance.on("call-start", () => {
      console.log("📞 Assistant started");
      setIsSpeaking(true);
      setLoading(false);
      setFinalJson(null);
      setSaveStatus("");
    });

    instance.on("call-end", () => {
      console.log("✅ Call ended");
      setIsSpeaking(false);
    });

    // 👂 Listen for user transcripts
    instance.on("transcript" as any, (data: any) => {
      if (data.transcriptType === "final") {
        console.log("🗣️ User:", data.transcript);
      }
    });

    // ✅ Correct structured output event (new format)
    instance.on("CaptureCustomer" as any, (event: any) => {
      console.log("📦 Structured Output Received:", event);

      const result = event?.data?.result || event?.result;
      if (!result) {
        console.warn("⚠️ Missing structured data in event:", event);
        return;
      }

      console.log("✅ Lead Data:", result);
      setFinalJson(result);
    });

    instance.on("structured-output" as any, (event: any) => {
      console.log("📦 Structured Output:", event);

      // Safely extract structured data
      const firstValue: any =
        event && typeof event === "object" ? Object.values(event)[0] : null;

      const data = event?.data?.result || firstValue?.result;

      if (data?.fullName && data?.phoneNumber) {
        setFinalJson(data);
        console.log("✅ Captured Lead:", data);
      }
    });

    return () => {
      instance.stop().catch(() => {});
    };
  }, []);
  console.log({ finalJson });

  const handleStart = useCallback(async () => {
    if (!vapi) return;
    setLoading(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const sessionRes = await startCustomerSession({
        assistantId: AssistantId as string,
      });
      const sessionData = sessionRes?.data ?? sessionRes;
      if (!sessionData?.sessionId) throw new Error("Session creation failed");

      await (vapi as any).start(AssistantId);
    } catch (e) {
      console.error("❌ Failed to start assistant:", e);
      setLoading(false);
      setIsSpeaking(false);
    }
  }, [vapi]);

  const handleStop = useCallback(async () => {
    if (!vapi) return;
    try {
      await vapi.stop();
    } catch (err) {
      console.error("Error stopping assistant:", err);
    }
    setIsSpeaking(false);
  }, [vapi]);

  // ✅ Manual Save
  const handleSave = async () => {
    if (!finalJson) return alert("No customer data captured yet.");
    setSaveStatus("Saving...");

    try {
      const res = await fetch("/api/vapi/save-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalJson),
      });
      const result = await res.json();
      if (result.success) setSaveStatus("✅ Saved successfully!");
      else setSaveStatus("❌ Save failed: " + result.message);
    } catch (err) {
      console.error(err);
      setSaveStatus("❌ Save failed.");
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold text-gray-900">
        🧾 Talk to Customer Assistant
      </h2>
      <p className="text-gray-600">
        Speak with the AI to collect lead information. After the session, review
        and save it.
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
            📋 Captured Customer Data
          </h3>
          <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-x-auto">
            {JSON.stringify(finalJson, null, 2)}
          </pre>
          <button
            onClick={handleSave}
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Save Customer
          </button>
          {saveStatus && (
            <p className="mt-2 text-sm text-gray-600">{saveStatus}</p>
          )}
        </div>
      )}
    </div>
  );
}
