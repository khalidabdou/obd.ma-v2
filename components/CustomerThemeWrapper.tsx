"use client";

import { useEffect, ReactNode } from "react";

export default function CustomerThemeWrapper({
  children,
}: {
  children: ReactNode;
}) {
  useEffect(() => {
    // Apply theme only to customer interface
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme) {
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      const preference = localStorage.getItem("theme-preference");
      if (!preference || preference === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light";
        document.documentElement.setAttribute("data-theme", systemTheme);
      } else {
        document.documentElement.setAttribute("data-theme", preference);
      }
    }

    // Listen for theme changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "theme") {
        const newTheme = e.newValue || "light";
        document.documentElement.setAttribute("data-theme", newTheme);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      // Clean up theme attribute when leaving customer interface
      document.documentElement.removeAttribute("data-theme");
    };
  }, []);

  return <>{children}</>;
}
