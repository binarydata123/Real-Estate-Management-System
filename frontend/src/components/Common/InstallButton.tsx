"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

// Define the BeforeInstallPromptEvent for TypeScript
interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
    prompt(): Promise<void>;
}

export default function InstallButton() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstallable, setIsInstallable] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            console.log("beforeinstallprompt fired");
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setIsInstallable(true);
        };

        window.addEventListener("beforeinstallprompt", handler);

        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) {
            console.warn("Install prompt not available yet");
            return;
        }

        deferredPrompt.prompt();

        const { outcome } = await deferredPrompt.userChoice;
        console.log("User choice:", outcome);

        // Clear state to hide button after install attempt
        setDeferredPrompt(null);
        setIsInstallable(false);
    };

    console.log(isInstallable)

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
