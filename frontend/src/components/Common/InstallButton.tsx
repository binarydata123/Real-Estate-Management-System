"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { showErrorToast } from "@/utils/toastHandler";

// Define the BeforeInstallPromptEvent for TypeScript
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      showErrorToast("Install prompt not available yet");
      return;
    }

    deferredPrompt.prompt();

    await deferredPrompt.userChoice;

    // Clear state to hide button after install attempt
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  if (!isInstallable) return null;

  return (
    <button
      onClick={handleInstall}
      className="relative p-2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
      title="Install App"
    >
      <Download />
    </button>
  );
}
