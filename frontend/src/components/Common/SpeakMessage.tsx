"use client";
import { useEffect } from "react";

export default function SpeakMessage() {
  useEffect(() => {
    console.log("speaking message called");

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        console.log("speaking message");
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
