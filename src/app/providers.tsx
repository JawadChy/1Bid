"use client"

import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  /* 
  wanted to disableTransitionChange as well, but that breaks the 
  themeToggle animation
  */
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
    >
      {children}
    </ThemeProvider>
  );
}