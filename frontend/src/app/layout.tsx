import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import SpeakMessage from "@/components/Common/SpeakMessage";
import { AppToastContainer } from "@/utils/toastHandler";
import NextTopLoader from "nextjs-toploader";
// import GlobalLogoutPopupProvider from "@/components/GlobalLogoutPopupProvider";
import PopupLayout from "@/components/GlobalLogoutPopupProvider";
import { getSettingsData } from "../lib/Common/Settings";

export const dynamic = 'force-dynamic';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Real Estate Management System",
  description: "Real Estate Management System",
  manifest: "/manifest.json",
};

// Configure the font
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter", // This creates a CSS variable
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const baseUrl = process.env.NEXT_PUBLIC_IMAGE_URL as string;
  const settingsResponse = await getSettingsData();
  const settingsData = settingsResponse?.data || null;
  return (
    <html lang="en" className={`${inter.variable}`}>
      {settingsData?.faviconUrl
        ?
          <link rel="icon" href={`${baseUrl}/favicon/extraSmall/${settingsData.faviconUrl}`} className="rounded-4xl" sizes="256x256" type="image/x-icon"/>
        :
          ''
      }
      <body
        suppressHydrationWarning={true}
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} font-sans antialiased`}
      >
        <ToastProvider>
          <AuthProvider>
            <PopupLayout>
              <NextTopLoader showSpinner={false} />
              {children}
              <AppToastContainer />
            </PopupLayout>
          </AuthProvider>
          <SpeakMessage />
        </ToastProvider>
         <script
  dangerouslySetInnerHTML={{
    __html: `
      window.__deferredPrompt = null;
      let promptReceived = false;
      
      window.addEventListener('beforeinstallprompt', function(e) {
        e.preventDefault();
        window.__deferredPrompt = e;
        promptReceived = true;
        window.dispatchEvent(new CustomEvent('installpromptready'));
      });
      
      // Add a fallback check after page load
      window.addEventListener('load', function() {
        setTimeout(function() {
          if (!promptReceived) {
            console.log('⚠️ beforeinstallprompt did not fire within 2 seconds');
          }
        }, 2000);
      });
    `,
  }}
/>
      </body>
    </html>
  );
}
