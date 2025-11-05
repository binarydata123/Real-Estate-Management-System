/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Vapi from "@vapi-ai/web";
import { createAssistant, getAIPrompt, logAIInteraction } from "@/lib/AI";
import { MicrophoneIcon, StopCircleIcon } from "@heroicons/react/24/solid";
import { Loader2 } from "lucide-react";

interface Props {
  propertyId: string;
  userId: string;
}

export default function PropertyVoiceAgent({ propertyId, userId }: Props) {
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [vapi, setVapi] = useState<Vapi | null>(null);

  const handleStart = async () => {
    setLoading(true);
    try {
      console.log("🎬 Starting AI Assistant...");

      // 1️⃣ Ask for mic permission early
      console.log("🎧 Requesting microphone access...");
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // 2️⃣ Fetch AI prompt
      const { data: promptData } = await getAIPrompt(propertyId, userId);
      const { prompt, cachedAssistantId } = promptData;
      console.log("🧠 Loaded AI Prompt:", prompt);

      // 3️⃣ Reuse or create assistant
      let assistantId = cachedAssistantId;
      if (!assistantId) {
        const response = await createAssistant({ prompt });
        if (!response.success || !response.assistantId)
          throw new Error("Failed to create assistant");
        assistantId = response.assistantId;
      }

      // 4️⃣ Stop any running instance
      if (vapi) {
        await vapi.stop().catch(() => {});
        setVapi(null);
      }

      // 5️⃣ Initialize new Vapi instance
      const vapiInstance = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY!);
      setVapi(vapiInstance);

      vapiInstance.on("call-start", () => setIsSpeaking(true));
      vapiInstance.on("call-end", () => setIsSpeaking(false));
      vapiInstance.on("error", (err) => console.error("❌ Vapi Error:", err));

      // 🧠 1️⃣ Log assistant responses
      // Handle AI responses (assistant messages)
      (vapiInstance as any).on("response", async (resp: any) => {
        const content = resp?.content?.trim?.();
        if (content) {
          console.log("🤖 Assistant response:", content);
          try {
            await logAIInteraction({
              userId,
              propertyId,
              assistantId,
              role: "assistant",
              message: content,
            });
          } catch (err) {
            console.error("⚠️ Failed to log assistant message:", err);
          }
        }
      });

      // Handle final user transcripts
      (vapiInstance as any).on("transcript", async (t: any) => {
        if (t?.final && t?.text?.trim()) {
          const text = t.text.trim();
          console.log("🗣️ User said:", text);
          try {
            await logAIInteraction({
              userId,
              propertyId,
              assistantId,
              role: "user",
              message: text,
            });
          } catch (err) {
            console.error("⚠️ Failed to log user message:", err);
          }
        }
      });

      // 6️⃣ Start the voice assistant session
      console.log("🚀 Starting voice session...");
      await vapiInstance.start(assistantId);
    } catch (err) {
      console.error("AI Start Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    if (!vapi) return;
    try {
      await vapi.stop();
    } catch (err) {
      console.error("Error stopping assistant:", err);
    } finally {
      setIsSpeaking(false);
      setVapi(null);
    }
  };

  return (
    <div className="flex items-center">
      <button
        onClick={isSpeaking ? handleStop : handleStart}
        disabled={loading}
        title={
          loading
            ? "Connecting..."
            : isSpeaking
            ? "Stop Assistant"
            : "Talk to AI Assistant"
        }
        className={`relative flex items-center justify-center w-10 h-10 rounded-full text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : isSpeaking
            ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
            : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
        }`}
      >
        {loading && <Loader2 className="h-5 w-5 animate-spin" />}
        {!loading &&
          (isSpeaking ? (
            <StopCircleIcon className="h-6 w-6" />
          ) : (
            <MicrophoneIcon className="h-6 w-6" />
          ))}
      </button>
    </div>
  );
}
