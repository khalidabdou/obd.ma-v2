"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PlayCircle } from "lucide-react";
import { useTranslation } from "@/Context/LanguageContext";

const STORAGE_KEY = "obd-video-tutorial-dismissed";

// Dispatch this event from anywhere to open the tutorial dialog on demand.
export const OPEN_TUTORIAL_EVENT = "obd-open-video-tutorial";

// YouTube video ID from https://www.youtube.com/watch?v=akW5ZixGIRw
const YOUTUBE_VIDEO_ID = "akW5ZixGIRw";
const YOUTUBE_EMBED_SRC = `https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&rel=0&modestbranding=1`;

export default function VideoTutorialDialog() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Auto-open on first visit (only on the home page — see `autoOpen` prop usage
  // in the layout). Manual triggers via the custom event always open regardless
  // of the dismissed flag.
  useEffect(() => {
    setMounted(true);
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY);
      if (dismissed !== "true") {
        setOpen(true);
      }
    } catch {
      // localStorage may be unavailable (private mode); default to showing.
      setOpen(true);
    }
  }, []);

  // Listen for manual open requests (e.g. from the NavBar tutorial button).
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener(OPEN_TUTORIAL_EVENT, handler);
    return () => window.removeEventListener(OPEN_TUTORIAL_EVENT, handler);
  }, []);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) {
      try {
        localStorage.setItem(STORAGE_KEY, "true");
      } catch {
        // Ignore write failures (private mode / storage disabled).
      }
    }
  }, []);

  if (!mounted) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl overflow-hidden border-border bg-background p-0 sm:rounded-xl dark:border-white/10 dark:bg-[#14161B]">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="flex items-center gap-2 text-foreground dark:text-white">
            <PlayCircle className="h-5 w-5 text-brand-red" />
            {t("home.video_tutorial_title")}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground dark:text-neutral-400">
            {t("home.video_tutorial_subtitle")}
          </DialogDescription>
        </DialogHeader>

        <div className="aspect-video w-full bg-black">
          <iframe
            className="h-full w-full"
            src={open ? YOUTUBE_EMBED_SRC : undefined}
            title={t("home.video_tutorial_title")}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        <div className="flex items-center justify-between gap-4 px-6 pb-6 pt-3">
          <p className="text-xs text-muted-foreground dark:text-neutral-400">
            {t("home.video_tutorial_dismiss_hint")}
          </p>
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            className="rounded-md bg-brand-red px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-red/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
          >
            {t("home.video_tutorial_close")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Convenience helper to open the tutorial dialog from any component. */
export function openVideoTutorial() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(OPEN_TUTORIAL_EVENT));
  }
}
