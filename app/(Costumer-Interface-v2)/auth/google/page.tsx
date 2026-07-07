"use client";

import { useEffect } from "react";

export default function GoogleAuthCallbackPage() {
  useEffect(() => {
    // Google Identity Services handles the popup redirect automatically.
    // If the popup is still open after a short delay, close it.
    const timer = setTimeout(() => {
      if (window.opener) {
        window.close();
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <p className="text-lg font-medium">Connexion en cours...</p>
    </div>
  );
}
