"use client";

import dynamic from "next/dynamic";
import type { ThemeProviderProps } from "next-themes";

// Temporary fix for https://github.com/shadcn-ui/ui/issues/5552
const NextThemesProvider = dynamic(
  () => import("next-themes").then((e) => e.ThemeProvider),
  {
    ssr: false,
  },
);

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
