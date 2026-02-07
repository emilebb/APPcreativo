"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/lib/authProvider";

type ProvidersProps = {
  children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      themes={["light", "dark", "night"]}
      defaultTheme="light"
      enableSystem={false}
    >
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}
