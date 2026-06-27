"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, Monitor } from "lucide-react";

type ThemePreference = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function ThemeToggle() {
  const [preference, setPreference] = useState<ThemePreference | null>(null);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

  useEffect(() => {
    const stored = localStorage.getItem("theme-preference") as ThemePreference | null;
    const initial = stored || "system";
    setPreference(initial);
    const resolved = initial === "system" ? getSystemTheme() : initial;
    setResolvedTheme(resolved);
    document.documentElement.setAttribute("data-theme", resolved);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (preference === "system") {
        const newTheme = e.matches ? "dark" : "light";
        setResolvedTheme(newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [preference]);

  const handleChange = (newPreference: ThemePreference) => {
    setPreference(newPreference);
    localStorage.setItem("theme-preference", newPreference);
    const resolved = newPreference === "system" ? getSystemTheme() : newPreference;
    localStorage.setItem("theme", resolved);
    setResolvedTheme(resolved);
    document.documentElement.setAttribute("data-theme", resolved);
  };

  if (!preference) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Moon className="h-5 w-5 opacity-0" />
      </Button>
    );
  }

  const icon =
    preference === "system" ? (
      <Monitor className="h-5 w-5" />
    ) : resolvedTheme === "light" ? (
      <Moon className="h-5 w-5" />
    ) : (
      <Sun className="h-5 w-5" />
    );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Toggle theme">
          {icon}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleChange("light")}>
          <Sun className="mr-2 h-4 w-4" /> Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleChange("dark")}>
          <Moon className="mr-2 h-4 w-4" /> Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleChange("system")}>
          <Monitor className="mr-2 h-4 w-4" /> System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
