import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import SpeakMessage from "@/components/Common/SpeakMessage";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning={true}
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider>
<<<<<<< HEAD
          <AuthProvider>
            {children}
          </AuthProvider>
          <SpeakMessage />
        </ToastProvider>
=======
          <AuthProvider>{children}</AuthProvider>
        </ToastProvider>
        <SpeakMessage />
>>>>>>> d6dd75f8fc3bf16a671d043f1a0fc2dcff61ac1d
      </body>
    </html>
  );
}
