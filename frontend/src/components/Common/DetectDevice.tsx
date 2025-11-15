import { showErrorToast } from "@/utils/toastHandler";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface DeviceInfo {
  platform: "ios" | "android" | "desktop" | "unknown";
  browser: "safari" | "chrome" | "firefox" | "edge" | "samsung" | "unknown";
  standalone: boolean;
  canInstall: boolean;
  installMethod: "native" | "manual" | "none";
}

export function detectDevice(): DeviceInfo {
  const userAgent = navigator.userAgent.toLowerCase();
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone ||
    document.referrer.includes("android-app://");

  // Platform detection
  let platform: DeviceInfo["platform"] = "unknown";
  if (/iphone|ipad|ipod/.test(userAgent)) {
    platform = "ios";
  } else if (/android/.test(userAgent)) {
    platform = "android";
  } else if (/windows|mac|linux/.test(userAgent)) {
    platform = "desktop";
  }

  // Browser detection
  let browser: DeviceInfo["browser"] = "unknown";
  if (/safari/.test(userAgent) && !/chrome|chromium|edg/.test(userAgent)) {
    browser = "safari";
  } else if (/chrome|chromium/.test(userAgent) && !/edg/.test(userAgent)) {
    browser = "chrome";
  } else if (/firefox/.test(userAgent)) {
    browser = "firefox";
  } else if (/edg/.test(userAgent)) {
    browser = "edge";
  } else if (/samsung/.test(userAgent)) {
    browser = "samsung";
  }

  // Installation capability detection
  const isDevEnvironment =
    window.location.hostname.includes("localhost") ||
    window.location.hostname.includes("stackblitz") ||
    window.location.hostname.includes("webcontainer");

  const canInstall =
    !standalone &&
    // Development environment - always allow install simulation
    (isDevEnvironment ||
      // iOS Safari (manual install)
      (platform === "ios" && browser === "safari") ||
      // Android browsers
      platform === "android" ||
      // Desktop browsers
      (platform === "desktop" && (browser === "chrome" || browser === "edge")));

  // Install method determination
  let installMethod: DeviceInfo["installMethod"] = "none";
  if (standalone) {
    installMethod = "none"; // Already installed
  } else if (
    "BeforeInstallPromptEvent" in window ||
    (platform === "android" && browser === "chrome") ||
    (platform === "desktop" && (browser === "chrome" || browser === "edge"))
  ) {
    installMethod = "native";
  } else if (platform === "ios" && browser === "safari") {
    installMethod = "manual";
  } else {
    installMethod = "manual";
  }

  return {
    platform,
    browser,
    standalone,
    canInstall,
    installMethod,
  };
}

export function getInstallInstructions(device: DeviceInfo): {
  title: string;
  steps: string[];
  buttonText?: string;
  warningMessage?: string;
} {
  const { platform, browser, standalone } = device;

  if (standalone) {
    return {
      title: "App Already Installed",
      steps: ["You already have this app installed on your device."],
      buttonText: "Open App",
    };
  }

  // iOS Safari
  if (platform === "ios" && browser === "safari") {
    return {
      title: "Add to Home Screen",
      steps: [
        "Tap the Share button at the bottom of the screen",
        'Scroll down and tap "Add to Home Screen"',
        'Tap "Add" in the top right corner',
        "The app will appear on your home screen",
      ],
    };
  }

  // iOS Chrome (redirect to Safari)
  if (platform === "ios" && browser === "chrome") {
    return {
      title: "Open in Safari to Install",
      steps: [
        "Tap the Share button below",
        'Select "Open in Safari"',
        "Follow the installation instructions in Safari",
      ],
      buttonText: "Open in Safari",
      warningMessage: "Installation is only available in Safari on iOS devices",
    };
  }

  // Android Chrome/Samsung Browser
  if (platform === "android") {
    return {
      title: "Install App",
      steps: [
        'Tap the "Install App" button below',
        "Confirm installation in the popup",
        "The app will be added to your home screen",
      ],
      buttonText: "Install App",
    };
  }

  // Desktop Chrome/Edge
  if (platform === "desktop") {
    if (browser === "chrome") {
      return {
        title: "Install App",
        steps: [
          'Click the "Install App" button below',
          "Or click the install icon in the address bar",
          "Confirm installation in the popup",
          "The app will be added to your desktop/start menu",
        ],
        buttonText: "Install App",
      };
    } else if (browser === "edge") {
      return {
        title: "Install App",
        steps: [
          'Click the "Install App" button below',
          'Or click the "+" icon in the address bar',
          "Confirm installation in the popup",
          "The app will be added to your start menu",
        ],
        buttonText: "Install App",
      };
    }
  }

  // Fallback for unsupported browsers
  return {
    title: "Browser Not Supported",
    steps: [
      "This browser doesn't support app installation",
      "Try opening this page in Chrome, Safari, or Edge",
      "For the best experience, use a supported browser",
    ],
    warningMessage: "Installation is not available in this browser",
  };
}

export function getBrowserIcon(browser: string): string {
  const icons: Record<string, string> = {
    safari: "🔵",
    chrome: "🟢",
    firefox: "🟠",
    edge: "🔷",
    samsung: "💙",
    unknown: "🌐",
  };
  return icons[browser] || icons.unknown;
}

export function getPlatformIcon(platform: string): string {
  const icons: Record<string, string> = {
    ios: "📱",
    android: "🤖",
    desktop: "💻",
    unknown: "📱",
  };
  return icons[platform] || icons.unknown;
}

export async function isPWAInstalled(): Promise<boolean> {
  // Already running in standalone
  if (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes("android-app://")
  ) {
    return true;
  }

  // Chrome/Edge API
  if ("getInstalledRelatedApps" in navigator) {
    try {
      const apps = await (navigator as any).getInstalledRelatedApps();
      if (apps && apps.length > 0) {
        return true;
      }
    } catch (err) {
      showErrorToast("get Installed Related Apps failed:", err);
    }
  }

  return false;
}
