/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Vapi from "@vapi-ai/web";
import {
  createAssistant,
  getAIPrompt,
  startAISession,
  logAISessionMessage,
} from "@/lib/AI";
import { MicrophoneIcon, StopCircleIcon } from "@heroicons/react/24/solid";
import { Loader2 } from "lucide-react";
import { showErrorToast } from "@/utils/toastHandler";

interface Props {
  propertyId: string;
  userId: string;
}

export default function PropertyVoiceAgent({ propertyId, userId }: Props) {
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [vapi, setVapi] = useState<Vapi | null>(null);
  // const [sessionId, setSessionId] = useState<string | null>(null);

  const handleStart = async () => {
    setLoading(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // 1️⃣ Get prompt + assistantId
      const { data: promptData } = await getAIPrompt(propertyId, userId);
      const { prompt, cachedAssistantId } = promptData;

      let assistantId = cachedAssistantId;
      if (!assistantId) {
        const response = await createAssistant({ prompt });
        if (!response.success || !response.assistantId)
          throw new Error("Failed to create assistant");
        assistantId = response.assistantId;
      }

      // 2️⃣ Create DB session
      const { data: sessionData } = await startAISession({
        propertyId,
        userId,
        assistantId,
      });
      const newSessionId = sessionData.sessionId;
      // setSessionId(newSessionId);

      // 3️⃣ Stop previous Vapi instance (if any)
      if (vapi) {
        await vapi.stop().catch(() => {});
        setVapi(null);
      }

      // 4️⃣ Init Vapi
      const vapiInstance = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY!);
      setVapi(vapiInstance);

      vapiInstance.on("call-start", () => setIsSpeaking(true));
      vapiInstance.on("call-end", () => setIsSpeaking(false));
      vapiInstance.on("error", (err) => showErrorToast("❌ Vapi Error:", err));

      vapiInstance.on("message", async (msg: any) => {
        if (!msg?.role || !msg?.content) return;
        const role = msg.role === "assistant" ? "assistant" : "user";
        const message =
          typeof msg.content === "string"
            ? msg.content
            : msg.content[0]?.text || "";

        if (newSessionId) {
          await logAISessionMessage({
            sessionId: newSessionId,
            role,
            message,
          });
        }
      });

      vapiInstance.on("transcript" as any, async (t: any) => {
        const text = t?.text?.trim?.();
        if (!text || !newSessionId) return;

        await logAISessionMessage({
          sessionId: newSessionId,
          role: "user",
          message: text,
        });
      });

      await vapiInstance.start(assistantId);
    } catch (err) {
      showErrorToast("AI Start Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    if (!vapi) return;
    try {
      await vapi.stop();
    } catch (err) {
      showErrorToast("Error stopping assistant:", err);
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
        className={`relative flex items-center justify-center w-10 h-10 rounded-full text-white transition-all duration-300 focus:outline-none ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : isSpeaking
            ? "bg-red-600 hover:bg-red-700"
            : "bg-blue-600 hover:bg-blue-700"
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
