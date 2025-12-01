import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import SpeakMessage from "@/components/Common/SpeakMessage";
import { AppToastContainer } from "@/utils/toastHandler";
import NextTopLoader from "nextjs-toploader";
import { getSettingsData } from "../lib/Common/Settings";


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
  const settingsResponse = await getSettingsData();
  const settingsData = settingsResponse?.data || null;
  return (
    <html lang="en" className={`${inter.variable}`}>
      {settingsData?.faviconUrl
        ?
          <link rel="icon" href={settingsData.faviconUrl} sizes="256x256" type="image/x-icon"/>
        :
          ''
      }
      <body
        suppressHydrationWarning={true}
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} font-sans antialiased`}
      >
        <ToastProvider>
          <AuthProvider>
            <NextTopLoader showSpinner={false} />
            {children}
            <AppToastContainer />
          </AuthProvider>
          <SpeakMessage />
        </ToastProvider>
      </body>
    </html>
  );
}
