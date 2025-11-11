"use client";
import { useEffect } from "react";

export default function SpeakMessage() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data?.type === "SPEAK_MESSAGE") {
          const utterance = new SpeechSynthesisUtterance(event.data.message);
          utterance.lang = "en-US"; // or "hi-IN"
          speechSynthesis.speak(utterance);
        }
      });
    }
  }, []);

  return null;
}
