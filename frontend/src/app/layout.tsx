import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
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

// Configure the font
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter', // This creates a CSS variable
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body
        suppressHydrationWarning={true}
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
          <SpeakMessage />
        </ToastProvider>
      </body>
    </html>
  );
}
