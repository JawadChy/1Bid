import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";
import { AuthProvider } from "./auth/auth-context";
import { Toaster } from "react-hot-toast";
import { AuthStatusCheck } from "@/components/auth-status-check";

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
  title: "1Bid",
  description: "The best e-bidding platform oat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <Providers>
            <AuthStatusCheck>{children}</AuthStatusCheck>
          </Providers>
          <Toaster position="bottom-center" />
        </AuthProvider>
      </body>
    </html>
  );
}
