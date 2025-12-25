"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { showErrorToast } from "@/utils/toastHandler";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface InstallButtonProp {
  isFrom?: string;
}

export default function InstallButton({ isFrom }: InstallButtonProp) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

useEffect(() => {
  if (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone
  ) {
    setIsInstallable(false);
    return;
  }

  const checkPrompt = () => {
    if (window.__deferredPrompt) {
      setDeferredPrompt(window.__deferredPrompt);
      setIsInstallable(true);
    }
  };

  checkPrompt();
  window.addEventListener("installpromptready", checkPrompt);

  return () =>
    window.removeEventListener("installpromptready", checkPrompt);
}, []);

 const handleInstall = async () => {
  if (!deferredPrompt) {
    showErrorToast("Install prompt not available yet");
    return;
  }

  await deferredPrompt.prompt();
  await deferredPrompt.userChoice;

  setDeferredPrompt(null);
  setIsInstallable(false);
};


  if (!isInstallable) return null;
  return (
    <>
      {isFrom === "Header" ? (
        <div onClick={handleInstall} title="Install App">
          <button className="relative px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Download className="w-4 h-4 relative z-10 animate-bounce" />
            <span className="relative z-10">Install App</span>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
          </button>
        </div>
      ) : (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={handleInstall}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span className="font-semibold">Install REAMS App</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          <p className="text-center text-xs text-gray-500 mt-2">
            Install our app for quick access and offline support
          </p>
        </div>
      )}
    </>
  );
}
