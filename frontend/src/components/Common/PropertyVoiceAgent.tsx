"use client";

import { useEffect, useState } from "react";
import Vapi from "@vapi-ai/web";
import { getAIPrompt } from "@/lib/AI";

interface Props {
    propertyId: string;
    userId: string;
}

export default function PropertyVoiceAgent({ propertyId, userId }: Props) {
    const [loading, setLoading] = useState(true);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [vapi, setVapi] = useState<Vapi | null>(null);

    useEffect(() => {
        let vapiInstance: Vapi | null = null;

        const fetchPromptAndStart = async () => {
            try {
                const { data } = await getAIPrompt(propertyId, userId);

                // Initialize Vapi client
                vapiInstance = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY!);
                setVapi(vapiInstance);

                await vapiInstance.start({
                    name: "Real Estate AI Advisor",
                    firstMessage: "Hello! Let me tell you about this fantastic property.",
                    model: {
                        provider: "openai",
                        model: "gpt-4o-mini",
                        messages: [
                            {
                                role: "system",
                                content: data.prompt,
                            },
                        ],
                    },
                    voice: {
                        provider: "cartesia",
                        voiceId: "alloy",
                    },
                    // Remove or adjust config if not supported by CreateAssistantDTO
                });

                // ✅ Event listeners
                vapiInstance.on("message", (msg) => console.log("AI message:", msg));
                vapiInstance.on("speech-start", () => console.log("Speech started"));
                vapiInstance.on("speech-end", () => console.log("Speech ended"));
                vapiInstance.on("call-start", () => console.log("Call started"));
                vapiInstance.on("call-end", () => console.log("Call ended"));
                vapiInstance.on("error", (err) => console.error("Vapi Error:", err));

                setIsSpeaking(true);
            } catch (err) {
                console.error("AI Start Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPromptAndStart();

        return () => {
            if (vapiInstance) vapiInstance.stop().catch(console.error);
        };
    }, [propertyId, userId]);

    if (loading) return <p>Loading AI Assistant...</p>;

    return (
        <button
            onClick={() => {
                if (vapi) {
                    vapi.stop();
                    setIsSpeaking(false);
                }
            }}
            className={`px-4 py-2 rounded-md text-white ${isSpeaking ? "bg-red-600" : "bg-blue-600"
                }`}
        >
            {isSpeaking ? "Stop Assistant" : "Start Assistant"}
        </button>
    );
}
