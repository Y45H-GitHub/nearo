"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { MotionConfig } from "framer-motion";
import type { ComponentProps } from "react";

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      {/* reducedMotion="user" collapses every Framer Motion animation in the
          app to near-zero duration when the OS prefers-reduced-motion is set
          — the single app-wide switch for design-tokens.md § 6's rule, rather
          than checking it in each animated component. */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </NextThemesProvider>
  );
}
