"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun, Monitor, Check } from "lucide-react";
import { useTheme } from "@/hooks/v2/useTheme";
import { useTranslation } from "@/Context/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function ThemeToggle() {
  const { preference, setPreference, resolvedTheme, mounted } = useTheme();
  const { t } = useTranslation();

  const isDark = resolvedTheme === "dark";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("theme.title")}
          title={t("theme.title")}
          className="relative rounded-full"
        >
          {mounted ? (
            preference === "system" ? (
              <Monitor className="h-5 w-5" />
            ) : isDark ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )
          ) : (
            <Sun className="h-5 w-5 opacity-0" />
          )}
          <span className="sr-only">{t("theme.title")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          onClick={() => setPreference("light")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Sun className="h-4 w-4 text-amber-500" />
          <span>{t("theme.light")}</span>
          {preference === "light" && <Check className="ml-auto h-4 w-4 text-brand-blue" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setPreference("dark")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Moon className="h-4 w-4 text-indigo-400" />
          <span>{t("theme.dark")}</span>
          {preference === "dark" && <Check className="ml-auto h-4 w-4 text-brand-blue" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setPreference("system")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Monitor className="h-4 w-4 text-emerald-500" />
          <span>{t("theme.system")}</span>
          {preference === "system" && <Check className="ml-auto h-4 w-4 text-brand-blue" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
