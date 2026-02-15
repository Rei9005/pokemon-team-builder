import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { TeamProvider } from '@/contexts/TeamContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { Header } from "@/components/layout/Header";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Pokemon Team Builder",
  description: "Build and analyze your Pokemon team",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <TeamProvider>
            <ToastProvider>
          <Header />
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
          </ToastProvider>
          </TeamProvider>
        </AuthProvider>
      </body>
    </html>
  );
}