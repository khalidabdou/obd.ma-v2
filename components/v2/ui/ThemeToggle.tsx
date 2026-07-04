"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/v2/useTheme";

export default function ThemeToggle() {
  const { resolvedTheme, toggle, mounted } = useTheme();

  const isDark = resolvedTheme === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={label}
      title={label}
      onClick={toggle}
      // Keep the button in the layout during SSR to avoid layout shift.
      // Icons stay invisible until we know the resolved theme on the client.
      className="relative"
    >
      <Sun
        className={`h-5 w-5 transition-all duration-300 ${
          mounted && !isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
        }`}
      />
      <Moon
        className={`absolute h-5 w-5 transition-all duration-300 ${
          mounted && isDark ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"
        }`}
      />
      <span className="sr-only">{label}</span>
    </Button>
  );
}
